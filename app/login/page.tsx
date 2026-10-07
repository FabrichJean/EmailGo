import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignIn } from "@clerk/nextjs";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/lib/i18n/server";
import { IconSend } from "../icons";
import AppPreview from "../AppPreview";

export default async function LoginPage() {
  const [session, { dict }] = await Promise.all([getSession(), getServerDictionary()]);

  if (session) {
    redirect("/");
  }

  // Un compte Clerk connecté mais banni n'a pas de session applicative (getSession() le
  // filtre) : on détecte ce cas ici pour afficher un message clair plutôt qu'un simple
  // retour silencieux à l'écran de connexion.
  const { userId: clerkId } = await auth();
  const isBanned = clerkId
    ? !!(await prisma.user.findUnique({ where: { clerkId }, select: { isBanned: true } }))?.isBanned
    : false;

  return (
    <div className="relative z-10 flex h-full items-center justify-center overflow-y-auto p-4">
      <div className="flex w-full max-w-4xl flex-col items-center gap-10 py-8 md:flex-row md:justify-center md:gap-16">
        <div className="flex w-full max-w-sm shrink-0 flex-col items-center gap-4 text-center">
          <span className="glow-accent flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <IconSend className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-foreground">{dict.auth.title}</h1>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{dict.auth.subtitle}</p>
          </div>

          {isBanned && (
            <p className="w-full rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 dark:bg-red-900/30 dark:text-red-300">
              {dict.auth.bannedMessage}
            </p>
          )}

          <SignIn routing="hash" forceRedirectUrl="/" signUpUrl="/login" />
        </div>

        <div className="hidden w-full max-w-sm md:block">
          <AppPreview />
        </div>
      </div>
    </div>
  );
}
