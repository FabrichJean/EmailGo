import { NextRequest, NextResponse } from "next/server";
import { getGoogleLoginOAuthClient, fetchGoogleUserInfo } from "@/lib/google-oauth";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth/session";
import { sendNotification } from "@/lib/notifier";
import { encrypt } from "@/lib/crypto";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const oauthError = request.nextUrl.searchParams.get("error");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  if (oauthError) {
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(oauthError)}`);
  }
  if (!code) {
    return NextResponse.redirect(`${appUrl}/login?error=missing_code`);
  }

  try {
    const oauth2Client = getGoogleLoginOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens.access_token) {
      return NextResponse.redirect(`${appUrl}/login?error=no_access_token`);
    }

    const info = await fetchGoogleUserInfo(tokens.access_token);

    const existingUser = await prisma.user.findUnique({ where: { email: info.email } });
    const isFirstUserEver = (await prisma.user.count()) === 0;

    const user = await prisma.user.upsert({
      where: { email: info.email },
      create: { email: info.email, name: info.name, avatarUrl: info.picture },
      update: { name: info.name, avatarUrl: info.picture },
    });

    if (user.isBanned) {
      return NextResponse.redirect(`${appUrl}/login?error=banned`);
    }

    // Un refresh_token n'est renvoyé que lors du tout premier octroi du scope gmail.send
    // pour ce compte Google — on en profite pour connecter automatiquement ce compte Gmail
    // comme premier compte d'envoi, sans que l'utilisateur ait à repasser par /connect.
    if (tokens.refresh_token) {
      await prisma.gmailAccount.upsert({
        where: { userId_email: { userId: user.id, email: info.email } },
        create: {
          userId: user.id,
          email: info.email,
          type: "oauth",
          refreshToken: encrypt(tokens.refresh_token),
          accessToken: tokens.access_token ? encrypt(tokens.access_token) : null,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
        update: {
          type: "oauth",
          refreshToken: encrypt(tokens.refresh_token),
          accessToken: tokens.access_token ? encrypt(tokens.access_token) : null,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          isActive: true,
        },
      });
    }

    if (!existingUser) {
      await sendNotification({
        title: "Nouvel utilisateur",
        body: `${user.email} vient de s'inscrire sur EmailGo.`,
        metadata: { userId: user.id, email: user.email },
      });
    }

    // La toute première personne à se connecter récupère les données pré-existantes
    // (comptes Gmail / templates / historique) créées avant l'introduction du multi-compte.
    if (isFirstUserEver && !existingUser) {
      await prisma.$transaction([
        prisma.gmailAccount.updateMany({ where: { userId: null }, data: { userId: user.id } }),
        prisma.template.updateMany({ where: { userId: null }, data: { userId: user.id } }),
        prisma.sentEmail.updateMany({ where: { userId: null }, data: { userId: user.id } }),
      ]);
    }

    await createSession(user.id);

    return NextResponse.redirect(`${appUrl}/`);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return NextResponse.redirect(`${appUrl}/login?error=${encodeURIComponent(message)}`);
  }
}
