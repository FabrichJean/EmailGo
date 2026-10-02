import type { Metadata } from "next";
import Link from "next/link";
import { IconSend, IconPlug, IconShield, IconChevronRight } from "../icons";

export const metadata: Metadata = {
  title: "Documentation — EmailGo",
  description: "Guide complet d'EmailGo : comptes Gmail, templates, génération par IA, envoi, historique et API.",
};

type NavGroup = { title: string; items: { href: string; label: string }[] };

const NAV: NavGroup[] = [
  {
    title: "Prise en main",
    items: [
      { href: "#demarrage", label: "Démarrage rapide" },
      { href: "#comptes-gmail", label: "Connecter Gmail" },
    ],
  },
  {
    title: "Templates",
    items: [
      { href: "#templates", label: "Créer un template" },
      { href: "#ia", label: "Génération par IA" },
    ],
  },
  {
    title: "Envoyer",
    items: [
      { href: "#envoi", label: "Envoi simple & en masse" },
      { href: "#historique", label: "Historique" },
    ],
  },
  {
    title: "Développeurs",
    items: [{ href: "#api", label: "Email Service & API" }],
  },
  {
    title: "Compte",
    items: [
      { href: "#compte", label: "Mon compte" },
      { href: "#admin", label: "Administration" },
    ],
  },
  {
    title: "Aide",
    items: [{ href: "#faq", label: "Questions fréquentes" }],
  },
];

export default function DocsPage() {
  return (
    <div className="relative z-10 h-dvh overflow-y-auto scroll-smooth">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#demarrage" className="flex items-center gap-2">
            <span className="glow-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <IconSend className="h-4 w-4" />
            </span>
            <span className="font-semibold text-foreground">EmailGo</span>
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-zinc-500">Docs</span>
          </a>
          <Link
            href="/"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium whitespace-nowrap text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Ouvrir l&apos;application
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-10 px-4 pt-10 pb-24 sm:px-6">
        {/* TOC */}
        <aside className="sticky top-20 hidden h-fit w-56 shrink-0 flex-col gap-6 lg:flex">
          {NAV.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">{group.title}</p>
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="block rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-foreground dark:text-zinc-400 dark:hover:bg-zinc-900"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 space-y-20">
          <DocSection id="demarrage" eyebrow="Prise en main" title="Démarrage rapide">
            <p>
              Tout part d&apos;un seul compte : connecte-toi à EmailGo avec Google, puis relie un ou plusieurs comptes
              Gmail qui serviront à envoyer tes emails. En quelques minutes, tu es prêt à prospecter.
            </p>
            <ol className="mt-4 flex flex-col gap-3">
              <Step n={1} title="Connexion à la plateforme">
                Depuis <Code>/login</Code>, connecte-toi avec Google. Ton compte EmailGo est créé automatiquement à la
                première connexion.
              </Step>
              <Step n={2} title="Connecter un compte Gmail d'envoi">
                Depuis <Code>/connect</Code>, ajoute le compte Gmail qui enverra réellement les emails — il peut être
                différent de ton compte de connexion.
              </Step>
              <Step n={3} title="Créer ton premier template">
                Rédige-le toi-même ou laisse l&apos;IA générer un brouillon, avec des variables pour personnaliser
                chaque envoi.
              </Step>
              <Step n={4} title="Envoyer">
                Un destinataire unique, une liste collée, ou un fichier CSV entier — à toi de choisir.
              </Step>
            </ol>
          </DocSection>

          <DocSection id="comptes-gmail" eyebrow="Prise en main" title="Connecter des comptes Gmail">
            <p>
              Depuis <Code>/connect</Code>, deux façons de relier un compte Gmail d&apos;envoi, selon ce qui te
              convient le mieux :
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <MiniCard icon={IconPlug} title="Connexion automatique (OAuth)">
                Le plus simple : connecte-toi avec Google, EmailGo gère le reste. Idéal si tu veux éviter toute
                manipulation de mot de passe.
              </MiniCard>
              <MiniCard icon={IconShield} title="Connexion manuelle (mot de passe d'application)">
                Active la validation en 2 étapes sur le compte Google concerné, génère un mot de passe
                d&apos;application dédié, et colle-le dans le formulaire.
              </MiniCard>
            </div>
            <p className="mt-4 text-sm text-zinc-500">
              Les identifiants (refresh token OAuth ou mot de passe d&apos;application) sont chiffrés avant stockage —
              jamais conservés en clair.
            </p>
          </DocSection>

          <DocSection id="templates" eyebrow="Templates" title="Créer un template">
            <p>
              Un template, c&apos;est un nom, un objet et un corps — avec des variables au format{" "}
              <Code>{"{{variable}}"}</Code> (ex. <Code>{"{{prenom}}"}</Code>, <Code>{"{{entreprise}}"}</Code>) qui
              seront remplacées à l&apos;envoi, destinataire par destinataire.
            </p>
            <ul className="mt-4 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
              <ListPoint>
                <strong className="text-foreground">Deux modes d&apos;édition</strong> — éditeur visuel (gras,
                italique, listes, liens) ou HTML brut avec coloration syntaxique, pour un contrôle total de la mise
                en forme.
              </ListPoint>
              <ListPoint>
                <strong className="text-foreground">Aperçu Bureau / Mobile</strong> — visualise le rendu réel avant
                l&apos;envoi, dans un cadre isolé qui reproduit fidèlement ce que verra le destinataire.
              </ListPoint>
              <ListPoint>
                <strong className="text-foreground">Envoi de test</strong> — depuis l&apos;onglet <Code>Test</Code>{" "}
                du template, envoie-toi une version avec des valeurs de variables au choix, avant de l&apos;utiliser
                en conditions réelles.
              </ListPoint>
            </ul>
          </DocSection>

          <DocSection id="ia" eyebrow="Templates" title="Génération par IA">
            <p>
              Pas envie de partir d&apos;une page blanche ? Depuis l&apos;éditeur de template, clique sur{" "}
              <Code>Générer avec l&apos;IA</Code>, décris en une phrase l&apos;email que tu veux (contexte, ton,
              objectif), choisis le format — texte ou HTML — et récupère un brouillon complet, variables comprises.
            </p>
            <p className="mt-3">
              Tu restes aux commandes : le brouillon généré est entièrement modifiable, dans l&apos;éditeur visuel
              comme en HTML.
            </p>
          </DocSection>

          <DocSection id="envoi" eyebrow="Envoyer" title="Envoi simple & en masse">
            <p>
              Depuis <Code>/send</Code>, choisis un compte Gmail et un template, puis envoie de trois façons :
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <MiniCard title="Destinataire unique">
                Saisis une adresse, personnalise les variables, envoie.
              </MiniCard>
              <MiniCard title="Liste collée">
                Colle une liste d&apos;adresses (séparées par virgules ou retours à la ligne) pour un envoi en
                série.
              </MiniCard>
              <MiniCard title="Import CSV">
                Importe un fichier avec une colonne par variable — chaque ligne devient un envoi personnalisé.
