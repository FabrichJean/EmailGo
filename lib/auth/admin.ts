import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "./session";

export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL ?? "";
}

export function isAdminEmail(email: string): boolean {
  const adminEmail = getAdminEmail();
  return !!adminEmail && email.toLowerCase() === adminEmail.toLowerCase();
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  // Longueurs différentes : comparaison à temps constant impossible, mais on n'a besoin
  // que d'éviter la fuite d'info sur le mot de passe correct, pas sur sa longueur.
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Guard pour les pages sous /admin (y compris /admin/unlock) : email admin requis,
// redirige tout le monde d'autre vers "/" sans indice que la zone admin existe.
export async function requireAdminEmail() {
  const session = await getSession();
  if (!session || !isAdminEmail(session.user.email)) {
    redirect("/");
  }
  return session;
}

// Guard complet (email + déverrouillage par mot de passe) pour la page /admin elle-même.
export async function requireAdminUnlocked() {
  const session = await requireAdminEmail();
  if (!session.isAdminUnlocked) {
    redirect("/admin/unlock");
  }
  return session;
}

// Variante pour les routes API : ne redirige jamais, renvoie null si non autorisé.
export async function getAdminSession() {
  const session = await getSession();
  if (!session || !isAdminEmail(session.user.email) || !session.isAdminUnlocked) {
    return null;
  }
  return session;
}

const ADMIN_UNLOCK_DURATION_MS = 2 * 60 * 60 * 1000; // 2h, à refaire ensuite (comme avant avec Session)

// Clerk gère les sessions : le déverrouillage admin (2e facteur par mot de passe) est
// maintenant un flag à expiration sur User plutôt que sur une ligne Session maison.
export async function unlockAdminSession(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { adminUnlockedUntil: new Date(Date.now() + ADMIN_UNLOCK_DURATION_MS) },
  });
}
