import { IconPlug, IconShield } from "../icons";
import { DocSection, MiniCard, Step, ListPoint, Faq, Code } from "./components";
import CodeBlockHighlighted from "./CodeBlock";
import CodeTabs from "./CodeTabs";
import Playground from "./Playground";
import { API_SNIPPETS } from "./apiSnippets";

export type NavGroup = { title: string; items: { href: string; label: string }[] };

export const NAV: NavGroup[] = [
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

export const strings = {
  docsBadge: "Docs",
  readyTitle: "Prêt à envoyer ton premier email ?",
  openEmailDo: "Ouvrir EmailDo",
};

export default function DocsContent() {
  return (
    <>
      <DocSection id="demarrage" eyebrow="Prise en main" title="Démarrage rapide">
        <p>
          Tout part d&apos;un seul compte : connecte-toi à EmailDo avec Google, puis relie un ou plusieurs comptes
          Gmail qui serviront à envoyer tes emails. En quelques minutes, tu es prêt à prospecter.
        </p>
        <ol className="mt-4 flex flex-col gap-3">
          <Step n={1} title="Connexion à la plateforme">
            Depuis <Code>/login</Code>, connecte-toi avec Google. Ton compte EmailDo est créé automatiquement à la
            première connexion.
          </Step>
          <Step n={2} title="Connecter un compte Gmail d'envoi">
            Depuis <Code>/connect</Code>, ajoute le compte Gmail qui enverra réellement les emails — il peut être
            différent de ton compte de connexion.
          </Step>
          <Step n={3} title="Créer ton premier template">
            Rédige-le toi-même ou laisse l&apos;IA générer un brouillon, avec des variables pour personnaliser chaque
            envoi.
          </Step>
          <Step n={4} title="Envoyer">
            Un destinataire unique, une liste collée, ou un fichier CSV entier — à toi de choisir.
          </Step>
        </ol>
      </DocSection>

      <DocSection id="comptes-gmail" eyebrow="Prise en main" title="Connecter des comptes Gmail">
        <p>
          Depuis <Code>/connect</Code>, deux façons de relier un compte Gmail d&apos;envoi, selon ce qui te convient
          le mieux :
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <MiniCard icon={IconPlug} title="Connexion automatique (OAuth)">
            Le plus simple : connecte-toi avec Google, EmailDo gère le reste. Idéal si tu veux éviter toute
            manipulation de mot de passe.
          </MiniCard>
          <MiniCard icon={IconShield} title="Connexion manuelle (mot de passe d'application)">
            Active la validation en 2 étapes sur le compte Google concerné, génère un mot de passe d&apos;application
            dédié, et colle-le dans le formulaire.
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
          <Code>{"{{variable}}"}</Code> (ex. <Code>{"{{prenom}}"}</Code>, <Code>{"{{entreprise}}"}</Code>) qui seront
          remplacées à l&apos;envoi, destinataire par destinataire.
        </p>
        <ul className="mt-4 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <ListPoint>
            <strong className="text-foreground">Deux modes d&apos;édition</strong> — éditeur visuel (gras, italique,
            listes, liens) ou HTML brut avec coloration syntaxique, pour un contrôle total de la mise en forme.
          </ListPoint>
          <ListPoint>
            <strong className="text-foreground">Aperçu Bureau / Mobile</strong> — visualise le rendu réel avant
            l&apos;envoi, dans un cadre isolé qui reproduit fidèlement ce que verra le destinataire.
          </ListPoint>
          <ListPoint>
            <strong className="text-foreground">Envoi de test</strong> — depuis l&apos;onglet <Code>Test</Code> du
            template, envoie-toi une version avec des valeurs de variables au choix, avant de l&apos;utiliser en
            conditions réelles.
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
          Tu restes aux commandes : le brouillon généré est entièrement modifiable, dans l&apos;éditeur visuel comme
          en HTML.
        </p>
      </DocSection>

      <DocSection id="envoi" eyebrow="Envoyer" title="Envoi simple & en masse">
        <p>
          Depuis <Code>/send</Code>, choisis un compte Gmail et un template, puis envoie de trois façons :
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <MiniCard title="Destinataire unique">Saisis une adresse, personnalise les variables, envoie.</MiniCard>
          <MiniCard title="Liste collée">
            Colle une liste d&apos;adresses (séparées par virgules ou retours à la ligne) pour un envoi en série.
          </MiniCard>
          <MiniCard title="Import CSV">
            Importe un fichier avec une colonne par variable — chaque ligne devient un envoi personnalisé.
          </MiniCard>
        </div>
      </DocSection>

      <DocSection id="historique" eyebrow="Envoyer" title="Historique">
        <p>
          Chaque envoi — réussi ou échoué — est consigné dans <Code>/history</Code>, avec le destinataire, le compte
          utilisé, le template et la raison en cas d&apos;échec. Filtre par statut pour repérer rapidement ce qui
          doit être relancé.
        </p>
      </DocSection>

      <DocSection id="api" eyebrow="Développeurs" title="Email Service & API">
        <p>
          Depuis <Code>/account</Code>, génère une clé API (format <Code>eg_…</Code>, affichée en clair une seule
          fois) pour envoyer des emails depuis tes propres applications, sans passer par l&apos;interface.
        </p>

        <h3 className="mt-6 mb-2 text-sm font-semibold text-foreground">Authentification</h3>
        <p>Transmets ta clé dans l&apos;en-tête de chaque requête :</p>
        <CodeBlockHighlighted lang="bash" code={`Authorization: Bearer eg_xxxxxxxxxxxxxxxxxxxxxxxx`} />

        <h3 className="mt-6 mb-2 text-sm font-semibold text-foreground">Services</h3>
        <p>
          Avant d&apos;envoyer, crée un <strong className="text-foreground">service</strong> depuis{" "}
          <Code>/email-service</Code> : un nom, un identifiant (<Code>serviceId</Code>, pré-rempli et modifiable) et
          un compte Gmail connecté. Le service porte déjà le compte d&apos;envoi — l&apos;API n&apos;a donc besoin
          que de son identifiant, jamais d&apos;un ID de compte Gmail brut.
        </p>

        <h3 className="mt-6 mb-2 text-sm font-semibold text-foreground">Endpoint</h3>
        <CodeBlockHighlighted lang="bash" code={`POST /api/v1/send`} />

        <div className="mt-6 mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Exemple</h3>
          <Playground />
        </div>
        <CodeTabs snippets={API_SNIPPETS} />
        <p className="mt-3 text-sm text-zinc-500">
          Réponse : <Code>{'{ "success": true }'}</Code> ou <Code>{'{ "error": "..." }'}</Code> avec un code HTTP
          correspondant. Le service doit appartenir au même compte que la clé API utilisée.
        </p>
      </DocSection>

      <DocSection id="compte" eyebrow="Compte" title="Mon compte">
        <p>
          Depuis <Code>/account</Code> : informations de ton compte, statistiques (comptes Gmail actifs, templates,
          emails envoyés), limite d&apos;envoi éventuelle, gestion des clés API, et déconnexion.
        </p>
      </DocSection>

      <DocSection id="admin" eyebrow="Compte" title="Administration">
        <p>
          Réservé à l&apos;adresse définie comme administratrice. Depuis <Code>/admin</Code> (déverrouillage par mot
          de passe dédié) : statistiques globales de la plateforme, gestion des utilisateurs — bannissement, coupure
          ou limitation de l&apos;envoi (par jour, semaine ou mois).
        </p>
      </DocSection>

      <DocSection id="faq" eyebrow="Aide" title="Questions fréquentes">
        <div className="flex flex-col gap-5">
          <Faq q="Le compte qui m'envoie des emails doit-il être le même que mon compte de connexion ?">
            Non. Ton compte de connexion sert d&apos;identité sur EmailDo ; les comptes Gmail connectés dans{" "}
            <Code>/connect</Code> sont ceux qui envoient réellement, et peuvent être différents.
          </Faq>
          <Faq q="Que se passe-t-il si je dépasse ma limite d'envoi ?">
            Si une limite a été fixée pour ton compte, les envois sont bloqués avec un message explicite jusqu&apos;à
            ce que la fenêtre glissante (jour, semaine ou mois) se libère.
          </Faq>
          <Faq q="Puis-je modifier un template généré par l'IA ?">
            Oui, entièrement — le texte généré n&apos;est qu&apos;un point de départ, modifiable dans l&apos;éditeur
            visuel comme en HTML.
          </Faq>
          <Faq q="Mes identifiants Gmail sont-ils en sécurité ?">
            Les secrets (refresh token OAuth, mot de passe d&apos;application) sont chiffrés avant stockage et ne sont
            jamais affichés en clair après la connexion.
          </Faq>
        </div>
      </DocSection>
    </>
  );
}
