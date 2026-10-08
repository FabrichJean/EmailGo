import type { Metadata } from "next";
import Link from "next/link";
import { IconSend } from "../icons";

export const metadata: Metadata = {
  title: "Conditions d'utilisation — EmailGo",
  description: "Conditions d'utilisation d'EmailGo.",
};

export default function TermsPage() {
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
        <h1 className="text-2xl font-semibold text-foreground">Conditions d&apos;utilisation</h1>
        <p className="mt-2 text-sm text-zinc-500">Dernière mise à jour : octobre 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
          <section>
            <h2 className="text-base font-semibold text-foreground">1. Objet</h2>
            <p className="mt-2">
              EmailGo est un service permettant d&apos;envoyer des emails personnalisés à partir
              de modèles, via un ou plusieurs comptes Gmail connectés par l&apos;utilisateur.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">2. Utilisation acceptable</h2>
            <p className="mt-2">
              Vous vous engagez à utiliser EmailGo dans le respect des lois applicables et des
              règles d&apos;utilisation de Google (notamment l&apos;interdiction d&apos;envoi de
              spam ou de contenus non sollicités). Tout usage abusif peut entraîner la suspension
              du compte.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">3. Compte utilisateur</h2>
            <p className="mt-2">
              Vous êtes responsable de la confidentialité de vos accès et de l&apos;activité
              effectuée depuis votre compte.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">4. Disponibilité du service</h2>
            <p className="mt-2">
              Le service est fourni &quot;en l&apos;état&quot;, sans garantie de disponibilité
              continue. Nous pouvons faire évoluer ou interrompre tout ou partie du service à tout
              moment.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">5. Contact</h2>
            <p className="mt-2">
              Pour toute question, contactez-nous à{" "}
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
