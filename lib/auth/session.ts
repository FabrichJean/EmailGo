import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifier";
import type { User } from "@/generated/prisma/client";

export type AppSession = { userId: string; user: User; isAdminUnlocked: boolean };

// Le scope gmail.send est demandé par Clerk lors de la connexion Google (configuré dans
// le dashboard Clerk) : si l'utilisateur l'a accordé, on connecte automatiquement ce
// compte comme premier compte d'envoi, sans passer par /connect. Le token est récupéré
// à la demande auprès de Clerk (lib/mailer.ts) plutôt que stocké/déchiffré par nous —
// Clerk gère déjà son renouvellement. Idempotent et non bloquant pour la connexion.
async function tryAutoConnectGmail(clerkId: string, userId: string, email: string) {
  try {
    const client = await clerkClient();
    const resp = await client.users.getUserOauthAccessToken(clerkId, "oauth_google");
    const hasToken = resp.data.some((t) => !!t.token);
    if (!hasToken) return;

    const existing = await prisma.gmailAccount.findUnique({ where: { userId_email: { userId, email } } });
    if (existing && !existing.clerkUserId) return; // compte déjà configuré manuellement : ne pas écraser

    await prisma.gmailAccount.upsert({
      where: { userId_email: { userId, email } },
      create: { userId, email, type: "oauth", clerkUserId: clerkId },
      update: { clerkUserId: clerkId, isActive: true },
    });
  } catch {
    // Scope non accordé, provider Google non connecté, ou erreur Clerk : jamais bloquant.
  }
}

// Clerk est la source de vérité pour l'identité (connexion) ; cette table User reste la
// source de vérité pour les données métier (bannissement, limites d'envoi...) et toutes
// les relations existantes (GmailAccount, Template, SentEmail, ApiKey, Service) qui
// pointent sur User.id — aucune n'a eu besoin de changer lors du passage à Clerk.
async function syncUser(clerkId: string): Promise<User | null> {
  const existing = await prisma.user.findUnique({ where: { clerkId } });
  if (existing) return existing;

  const cu = await currentUser();
  const email = cu?.primaryEmailAddress?.emailAddress;
  if (!email) return null;

  // Compte créé avant l'introduction de Clerk (identifié par email uniquement) : on le lie
  // au compte Clerk au lieu d'en créer un second, pour ne rien perdre de son historique.
  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail) {
    const linked = await prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        clerkId,
        name: cu?.fullName ?? existingByEmail.name,
        avatarUrl: cu?.imageUrl ?? existingByEmail.avatarUrl,
      },
    });
    await tryAutoConnectGmail(clerkId, linked.id, email);
    return linked;
  }

  const isFirstUserEver = (await prisma.user.count()) === 0;
  const user = await prisma.user.create({
    data: { clerkId, email, name: cu?.fullName, avatarUrl: cu?.imageUrl },
  });

  await sendNotification({
    title: "Nouvel utilisateur",
    body: `${user.email} vient de s'inscrire sur EmailGo.`,
    metadata: { userId: user.id, email: user.email },
  });

  // La toute première personne à se connecter récupère les données pré-existantes
  // (comptes Gmail / templates / historique) créées avant l'introduction du multi-compte.
  if (isFirstUserEver) {
    await prisma.$transaction([
      prisma.gmailAccount.updateMany({ where: { userId: null }, data: { userId: user.id } }),
      prisma.template.updateMany({ where: { userId: null }, data: { userId: user.id } }),
      prisma.sentEmail.updateMany({ where: { userId: null }, data: { userId: user.id } }),
    ]);
  }

  await tryAutoConnectGmail(clerkId, user.id, email);
  return user;
}

export async function getSession(): Promise<AppSession | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await syncUser(clerkId);
  if (!user || user.isBanned) return null;

  const isAdminUnlocked = !!user.adminUnlockedUntil && user.adminUnlockedUntil > new Date();
  return { userId: user.id, user, isAdminUnlocked };
}

export async function requireUser(): Promise<User> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session.user;
}
