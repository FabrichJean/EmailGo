import type { Metadata } from "next";
import Link from "next/link";
import { IconSend } from "../icons";

export const metadata: Metadata = {
  title: "Politique de confidentialité — EmailGo",
  description: "Politique de confidentialité d'EmailGo.",
};

export default function PrivacyPage() {
  return (
    <div className="relative z-10 h-dvh overflow-y-auto">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="glow-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <IconSend className="h-4 w-4" />
            </span>
            <span className="font-semibold text-foreground">EmailGo</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold text-foreground">Politique de confidentialité</h1>
        <p className="mt-2 text-sm text-zinc-500">Dernière mise à jour : octobre 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-base font-semibold text-foreground">1. Données collectées</h2>
            <p className="mt-2">
              EmailGo collecte votre adresse email, votre nom et votre photo de profil lors de la
              connexion (via Clerk). Si vous connectez un compte Gmail pour l&apos;envoi
              d&apos;emails, nous accédons uniquement aux autorisations nécessaires à l&apos;envoi
              de messages en votre nom (scope <code>gmail.send</code>), jamais à la lecture de
              votre boîte de réception.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">2. Utilisation des données</h2>
            <p className="mt-2">
              Les données sont utilisées exclusivement pour faire fonctionner le service : gérer
              votre compte, envoyer les emails que vous composez via l&apos;application, et
              afficher l&apos;historique de vos envois.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">3. Partage des données</h2>
            <p className="mt-2">
              Nous ne vendons ni ne partageons vos données avec des tiers, à l&apos;exception des
              prestataires techniques nécessaires au fonctionnement du service (authentification
              via Clerk, envoi via l&apos;API Google).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">4. Conservation et suppression</h2>
            <p className="mt-2">
              Vos données sont conservées tant que votre compte est actif. Vous pouvez demander la
              suppression de votre compte et de vos données à tout moment en nous contactant.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">5. Contact</h2>
            <p className="mt-2">
              Pour toute question concernant cette politique, contactez-nous à{" "}
              <a href="mailto:contact.fabrich@gmail.com" className="text-accent underline">
                contact.fabrich@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
