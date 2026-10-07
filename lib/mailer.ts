import nodemailer from "nodemailer";
import MailComposer from "nodemailer/lib/mail-composer/index.js";
import { OAuth2Client } from "google-auth-library";
import { gmail } from "googleapis/build/src/apis/gmail";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { renderTemplate, nl2br } from "@/lib/template";
import { checkSendAllowed } from "@/lib/send-limit";
import { sendNotification } from "@/lib/notifier";
import type { GmailAccount } from "@/generated/prisma/client";

type Message = { from: string; to: string; subject: string; html: string };

async function sendViaSmtp(account: GmailAccount, message: Message) {
  if (!account.appPassword) {
    throw new Error(`Compte SMTP ${account.email} sans mot de passe d'application enregistré`);
  }
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user: account.email, pass: decrypt(account.appPassword) },
  });
  await transport.sendMail(message);
}

function buildRawMessage(message: Message): Promise<string> {
  return new Promise((resolve, reject) => {
    new MailComposer(message).compile().build((err: Error | null, mimeMessage: Buffer) => {
      if (err) {
        reject(err);
        return;
      }
      const raw = mimeMessage
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      resolve(raw);
    });
  });
}

// L'envoi OAuth passe par l'API Gmail (et non le SMTP + XOAUTH2 de Gmail, plus fragile
// et sujet à des rejets d'authentification même avec un token valide et le bon scope).
async function sendViaGmailApi(account: GmailAccount, message: Message) {
  let oauth2Client: OAuth2Client;

  if (account.clerkUserId) {
    // Compte auto-connecté à l'inscription via le scope gmail.send demandé par Clerk :
    // pas de refresh token stocké chez nous, on récupère un token d'accès valide auprès
    // de Clerk à chaque envoi (il gère lui-même le renouvellement).
    const client = await clerkClient();
    const resp = await client.users.getUserOauthAccessToken(account.clerkUserId, "oauth_google");
    const accessToken = resp.data[0]?.token;
    if (!accessToken) {
      throw new Error(`Impossible d'obtenir un token Google via Clerk pour ${account.email}`);
    }
    oauth2Client = new OAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
  } else {
    if (!account.refreshToken) {
      throw new Error(`Compte OAuth ${account.email} sans refresh token enregistré`);
    }
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    if (!clientId || !clientSecret) {
      throw new Error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET manquants dans .env");
    }
    oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
    oauth2Client.setCredentials({ refresh_token: decrypt(account.refreshToken) });
  }

  const gmailClient = gmail({ version: "v1", auth: oauth2Client });
  const raw = await buildRawMessage(message);
  await gmailClient.users.messages.send({ userId: "me", requestBody: { raw } });
}

function buildMessage(account: GmailAccount, params: { recipient: string; subject: string; body: string }): Message {
  return { from: account.email, to: params.recipient, subject: params.subject, html: params.body };
}

export type SendResult = { status: "sent" } | { status: "failed"; error: string };

export async function sendTemplatedEmail(params: {
  userId: string;
  accountId: string;
  templateId?: string;
  recipient: string;
  subject?: string;
  body?: string;
  variables?: Record<string, string>;
}): Promise<SendResult> {
  const logFailure = async (error: string, subject: string, body: string) => {
    await prisma.sentEmail.create({
      data: {
        userId: params.userId,
        gmailAccountId: params.accountId,
        templateId: params.templateId,
        recipient: params.recipient,
        subject,
        body,
        status: "failed",
        error,
      },
    });
    return { status: "failed", error } as const;
  };

  const sendCheck = await checkSendAllowed(params.userId);
  if (!sendCheck.allowed) {
    return logFailure(sendCheck.reason, params.subject ?? "", params.body ?? "");
  }

  const account = await prisma.gmailAccount.findFirst({
    where: { id: params.accountId, userId: params.userId },
  });

  if (!account || !account.isActive) {
    return logFailure("Compte Gmail introuvable ou inactif", params.subject ?? "", params.body ?? "");
  }

  let subject = params.subject ?? "";
  let body = params.body ?? "";

  if (params.templateId) {
    const template = await prisma.template.findFirst({
      where: { id: params.templateId, userId: params.userId },
    });
    if (!template) {
      return logFailure("Template introuvable", subject, body);
    }
    const variables = params.variables ?? {};
    subject = renderTemplate(template.subject, variables);
    body = renderTemplate(template.body, variables);
  }

  // Le corps est stocké en texte avec de simples retours à la ligne ; on les convertit
  // en <br> juste avant l'envoi puisque le message part en HTML.
  body = nl2br(body);

  try {
    const message = buildMessage(account, { recipient: params.recipient, subject, body });
    if (account.type === "smtp") {
      await sendViaSmtp(account, message);
    } else if (account.type === "oauth") {
      await sendViaGmailApi(account, message);
    } else {
      throw new Error(`Type de compte Gmail inconnu: ${account.type}`);
    }

    await prisma.sentEmail.create({
      data: {
        userId: params.userId,
        gmailAccountId: account.id,
        templateId: params.templateId,
        recipient: params.recipient,
        subject,
        body,
        status: "sent",
      },
    });

    await sendNotification({
      title: "Email envoyé",
      body: `${params.recipient} (depuis ${account.email})`,
      metadata: { userId: params.userId, accountId: account.id, recipient: params.recipient },
    });

    return { status: "sent" };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return logFailure(error, subject, body);
  }
}
