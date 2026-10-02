// Génération de templates par IA via l'API NVIDIA (compatible OpenAI /chat/completions).
//
// Un petit modèle instruct ne suit pas de façon fiable un format JSON strict dès que
// le corps contient des guillemets HTML (quotes non échappées -> JSON invalide). On lui
// demande donc un format texte simple à une seule contrainte ("SUBJECT: ..." sur la
// première ligne), beaucoup plus robuste, pour les deux modes (texte brut ou HTML).

const NVIDIA_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";

const COMMON_RULES = `Réponds TOUJOURS en commençant par exactement une ligne "SUBJECT: <objet de l'email>", puis une ligne vide, puis uniquement le corps de l'email (rien d'autre avant ou après : pas d'intro, pas de markdown, pas de balises html/head/body).
Utilise des variables au format {{variable}} (ex: {{prenom}}, {{entreprise}}) pour personnaliser le message selon la description fournie.
Le ton doit être professionnel et concis.`;

const TEXT_SYSTEM_PROMPT = `Tu rédiges des emails de prospection commerciale en français.
${COMMON_RULES}
Le corps doit être en texte brut, sans aucune balise HTML.`;

const HTML_SYSTEM_PROMPT = `Tu rédiges des emails de prospection commerciale en français, au format HTML.
${COMMON_RULES}
Le corps doit être en HTML simple : uniquement les balises <p>, <br>, <strong>, <em>, <a>, <ul>, <li>. Pas de <style> ni <script>. Utilise des guillemets simples pour les attributs HTML (ex: <a href='...'>).`;

export type GeneratedTemplate = { name: string; subject: string; body: string };
export type ChatMessage = { role: "user" | "assistant"; content: string };

async function callNvidia(
  messages: { role: string; content: string }[],
  options: { temperature: number; maxTokens: number },
): Promise<string> {
  const apiKey = process.env.NVIDIA_API_KEY;
  const model = process.env.NVIDIA_MODEL;
  if (!apiKey || !model) {
    throw new Error("NVIDIA_API_KEY / NVIDIA_MODEL manquants dans .env");
  }

  const res = await fetch(NVIDIA_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    }),
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Erreur de l'API NVIDIA (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const content: string | undefined = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Réponse de l'API NVIDIA vide ou inattendue");
  }
  return content;
}

export async function generateTemplate(prompt: string, mode: "text" | "html" = "text"): Promise<GeneratedTemplate> {
  const content = await callNvidia(
    [
      { role: "system", content: mode === "html" ? HTML_SYSTEM_PROMPT : TEXT_SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    { temperature: 0.6, maxTokens: 1024 },
  );

  return parseGeneratedTemplate(content);
}

// Base de connaissance condensée (reflète app/docs/content.fr.tsx) servant de contexte
// à l'assistant de la page /docs — garde-le à jour avec la doc si elle évolue.
const DOCS_KNOWLEDGE = `EmailGo est une plateforme de prospection par email qui connecte des comptes Gmail, permet de créer des templates réutilisables (avec génération par IA) et d'envoyer des emails un par un, en masse (CSV, liste), ou par programmation via une API.

Démarrage : /login pour se connecter avec Google (compte créé automatiquement) ; /connect pour relier un ou plusieurs comptes Gmail d'envoi (différents du compte de connexion), en automatique (OAuth Google) ou manuel (mot de passe d'application Google, nécessite la validation en 2 étapes). Les identifiants sont chiffrés avant stockage, jamais en clair.

Templates (/templates) : nom, objet, corps avec variables {{variable}} (ex: {{prenom}}, {{entreprise}}) remplacées à l'envoi. Deux modes d'édition : éditeur visuel (gras, italique, listes, liens) ou HTML brut avec coloration syntaxique. Aperçu Bureau/Mobile en temps réel. Onglet "Test" pour s'envoyer une version de test avec des valeurs de variables choisies. Onglet "Paramètres" : nom, ID, date de création, suppression.

Génération par IA : bouton "Générer avec l'IA" dans l'éditeur de template, avec choix du format (texte ou HTML), à partir d'une simple description en langage naturel. Le brouillon généré reste entièrement modifiable.

Envoi (/send) : choisir un compte Gmail et un template, puis envoyer à un destinataire unique, via une liste d'adresses collée, ou via import CSV (une colonne par variable, une ligne par destinataire).

Historique (/history) : liste de tous les envois (réussis ou échoués) avec destinataire, compte utilisé, template, et raison de l'échec le cas échéant. Filtrable par statut.

Email Service & API (/email-service, /account) : depuis /account, génération d'une clé API (préfixe eg_, affichée en clair une seule fois). Depuis /email-service, création de "services" : un nom, un identifiant (serviceId) et un compte Gmail connecté associé — le service porte déjà le compte d'envoi. L'API publique est POST /api/v1/send, authentifiée par "Authorization: Bearer <clé API>" (pas de JWT), avec un corps JSON { serviceId, templateId, recipient, variables }. Réponse : { success: true } ou { error: "..." } avec un code HTTP. Le service appelé doit appartenir au même compte que la clé API.

Compte (/account) : infos du compte, statistiques (comptes Gmail actifs, templates, emails envoyés), limite d'envoi éventuelle, gestion des clés API, déconnexion.

Administration (/admin, réservé à l'adresse admin, déverrouillage par mot de passe dédié) : statistiques globales de la plateforme, gestion des utilisateurs (bannissement, coupure ou limitation de l'envoi par jour/semaine/mois).

Sécurité : secrets Gmail (refresh token OAuth, mot de passe d'application) chiffrés avant stockage, jamais affichés en clair après connexion.`;

const CHAT_SYSTEM_PROMPT = `Tu es l'assistant de documentation d'EmailGo, une plateforme de prospection par email. Réponds aux questions des visiteurs de façon claire, concise et utile, en te basant UNIQUEMENT sur les informations ci-dessous.

Si la question ne concerne pas EmailGo ou si tu ne trouves pas la réponse dans ces informations, dis-le honnêtement plutôt que d'inventer une réponse, et propose de consulter la documentation complète ou de contacter le support.

Réponds dans la même langue que la question posée (français ou anglais). Reste bref (quelques phrases), sans formatage markdown superflu.

--- Informations sur EmailGo ---
${DOCS_KNOWLEDGE}`;

export async function answerDocsQuestion(messages: ChatMessage[]): Promise<string> {
  return callNvidia([{ role: "system", content: CHAT_SYSTEM_PROMPT }, ...messages], {
    temperature: 0.4,
    maxTokens: 500,
  });
}

function parseGeneratedTemplate(content: string): GeneratedTemplate {
  const match = content.match(/subject:\s*(.+)\r?\n+([\s\S]+)/i);
  if (!match) {
    throw new Error("Impossible d'extraire le sujet et le corps de la réponse générée");
  }

  const subject = match[1].trim();
  const body = match[2].trim();
  if (!subject || !body) {
    throw new Error("Réponse générée incomplète");
  }

  return { name: deriveName(subject), subject, body };
}

// Le modèle n'est pas sollicité pour un "nom interne" séparé (point de rupture en
// moins) : on le dérive simplement de l'objet généré.
function deriveName(subject: string): string {
  const words = subject.replace(/\{\{[^}]*\}\}/g, "").trim().split(/\s+/);
  return words.slice(0, 6).join(" ") || subject;
}
