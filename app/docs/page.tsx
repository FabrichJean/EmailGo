import type { Metadata } from "next";
import Link from "next/link";
import { IconSend, IconPlug, IconShield, IconChevronRight } from "../icons";
import CodeBlockHighlighted from "./CodeBlock";
import CodeTabs from "./CodeTabs";
import Playground from "./Playground";

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
              </MiniCard>
            </div>
          </DocSection>

          <DocSection id="historique" eyebrow="Envoyer" title="Historique">
            <p>
              Chaque envoi — réussi ou échoué — est consigné dans <Code>/history</Code>, avec le destinataire, le
              compte utilisé, le template et la raison en cas d&apos;échec. Filtre par statut pour repérer rapidement
              ce qui doit être relancé.
            </p>
          </DocSection>

          <DocSection id="api" eyebrow="Développeurs" title="Email Service & API">
            <p>
              Depuis <Code>/account</Code>, génère une clé API (format <Code>eg_…</Code>, affichée en clair une
              seule fois) pour envoyer des emails depuis tes propres applications, sans passer par
              l&apos;interface.
            </p>

            <h3 className="mt-6 mb-2 text-sm font-semibold text-foreground">Authentification</h3>
            <p>Transmets ta clé dans l&apos;en-tête de chaque requête :</p>
            <CodeBlockHighlighted lang="bash" code={`Authorization: Bearer eg_xxxxxxxxxxxxxxxxxxxxxxxx`} />

            <h3 className="mt-6 mb-2 text-sm font-semibold text-foreground">Services</h3>
            <p>
              Avant d&apos;envoyer, crée un <strong className="text-foreground">service</strong> depuis{" "}
              <Code>/email-service</Code> : un nom, un identifiant (<Code>serviceId</Code>, pré-rempli et modifiable)
              et un compte Gmail connecté. Le service porte déjà le compte d&apos;envoi — l&apos;API n&apos;a donc
              besoin que de son identifiant, jamais d&apos;un ID de compte Gmail brut.
            </p>

            <h3 className="mt-6 mb-2 text-sm font-semibold text-foreground">Endpoint</h3>
            <CodeBlockHighlighted lang="bash" code={`POST /api/v1/send`} />

            <div className="mt-6 mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Exemple</h3>
              <Playground />
            </div>
            <CodeTabs
              snippets={[
                {
                  label: "cURL",
                  lang: "bash",
                  code: `curl -X POST https://ton-domaine.com/api/v1/send \\
  -H "Authorization: Bearer eg_xxxxxxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "serviceId": "notifications-support-a1b2c3d4",
    "templateId": "cmur4dgmz00003hjxwrbjymx8",
    "recipient": "destinataire@exemple.com",
    "variables": { "prenom": "Alex" }
  }'`,
                },
                {
                  label: "JavaScript",
                  lang: "javascript",
                  code: `const res = await fetch("https://ton-domaine.com/api/v1/send", {
  method: "POST",
  headers: {
    Authorization: "Bearer eg_xxxxxxxxxxxxxxxxxxxxxxxx",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    serviceId: "notifications-support-a1b2c3d4",
    templateId: "cmur4dgmz00003hjxwrbjymx8",
    recipient: "destinataire@exemple.com",
    variables: { prenom: "Alex" },
  }),
});

const data = await res.json();`,
                },
                {
                  label: "Python",
                  lang: "python",
                  code: `import requests

response = requests.post(
    "https://ton-domaine.com/api/v1/send",
    headers={"Authorization": "Bearer eg_xxxxxxxxxxxxxxxxxxxxxxxx"},
    json={
        "serviceId": "notifications-support-a1b2c3d4",
        "templateId": "cmur4dgmz00003hjxwrbjymx8",
        "recipient": "destinataire@exemple.com",
        "variables": {"prenom": "Alex"},
    },
)

print(response.json())`,
                },
              ]}
            />
            <p className="mt-3 text-sm text-zinc-500">
              Réponse : <Code>{'{ "success": true }'}</Code> ou <Code>{'{ "error": "..." }'}</Code> avec un code HTTP
              correspondant. Le service doit appartenir au même compte que la clé API utilisée.
            </p>
          </DocSection>

          <DocSection id="compte" eyebrow="Compte" title="Mon compte">
            <p>
              Depuis <Code>/account</Code> : informations de ton compte, statistiques (comptes Gmail actifs,
              templates, emails envoyés), limite d&apos;envoi éventuelle, gestion des clés API, et déconnexion.
            </p>
          </DocSection>

          <DocSection id="admin" eyebrow="Compte" title="Administration">
            <p>
              Réservé à l&apos;adresse définie comme administratrice. Depuis <Code>/admin</Code> (déverrouillage par
              mot de passe dédié) : statistiques globales de la plateforme, gestion des utilisateurs — bannissement,
              coupure ou limitation de l&apos;envoi (par jour, semaine ou mois).
            </p>
          </DocSection>

          <DocSection id="faq" eyebrow="Aide" title="Questions fréquentes">
            <div className="flex flex-col gap-5">
              <Faq q="Le compte qui m'envoie des emails doit-il être le même que mon compte de connexion ?">
                Non. Ton compte de connexion sert d&apos;identité sur EmailGo ; les comptes Gmail connectés dans{" "}
                <Code>/connect</Code> sont ceux qui envoient réellement, et peuvent être différents.
              </Faq>
              <Faq q="Que se passe-t-il si je dépasse ma limite d'envoi ?">
                Si une limite a été fixée pour ton compte, les envois sont bloqués avec un message explicite jusqu&apos;à
                ce que la fenêtre glissante (jour, semaine ou mois) se libère.
              </Faq>
              <Faq q="Puis-je modifier un template généré par l'IA ?">
                Oui, entièrement — le texte généré n&apos;est qu&apos;un point de départ, modifiable dans
                l&apos;éditeur visuel comme en HTML.
              </Faq>
              <Faq q="Mes identifiants Gmail sont-ils en sécurité ?">
                Les secrets (refresh token OAuth, mot de passe d&apos;application) sont chiffrés avant stockage et ne
                sont jamais affichés en clair après la connexion.
              </Faq>
            </div>
          </DocSection>

          <div className="flex flex-col items-center gap-3 border-t border-border pt-10 text-center">
            <p className="text-sm text-zinc-500">Prêt à envoyer ton premier email ?</p>
            <Link
              href="/login"
              className="glow-accent flex items-center gap-1.5 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              Ouvrir EmailGo
              <IconChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}

function DocSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <p className="mb-1 text-xs font-semibold tracking-wide text-accent uppercase">{eyebrow}</p>
      <h2 className="mb-4 text-2xl font-semibold text-foreground">{title}</h2>
      <div className="text-[15px] leading-relaxed text-zinc-700 dark:text-zinc-300">{children}</div>
    </section>
  );
}

function MiniCard({
  icon: Icon,
  title,
  children,
}: {
  icon?: (props: { className?: string }) => React.ReactElement;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card flex flex-col gap-2 p-4">
      <div className="flex items-center gap-2">
        {Icon && (
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent">
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}
        <p className="text-sm font-medium text-foreground">{title}</p>
      </div>
      <p className="text-sm text-zinc-500">{children}</p>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="glow-accent flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
        {n}
      </span>
      <p>
        <strong className="text-foreground">{title}</strong> — <span className="text-zinc-600 dark:text-zinc-400">{children}</span>
      </p>
    </li>
  );
}

function ListPoint({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
      <span>{children}</span>
    </li>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <p className="mb-1 text-sm font-medium text-foreground">{q}</p>
      <p className="text-sm text-zinc-500">{children}</p>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[0.85em] text-accent">{children}</code>
  );
}
