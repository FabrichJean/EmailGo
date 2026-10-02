// Génération de templates par IA via l'API NVIDIA (compatible OpenAI /chat/completions).
//
// Un petit modèle instruct ne suit pas de façon fiable un format JSON strict dès que
// le corps contient des guillemets HTML (quotes non échappées -> JSON invalide). On lui
// demande donc un format texte simple à une seule contrainte ("SUBJECT: ..." sur la
// première ligne), beaucoup plus robuste, pour les deux modes (texte brut ou HTML).

import fs from "node:fs";
import path from "node:path";

const NVIDIA_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";

// Base de connaissance de l'assistant /docs : fichier markdown à part (lib/ai/docs-context.md)
// plutôt qu'une constante en dur, pour pouvoir l'enrichir sans toucher au code. Lu une fois
// au chargement du module (le serveur tourne en continu, pas de cold start serverless ici).
const DOCS_CONTEXT = fs.readFileSync(path.join(process.cwd(), "lib/ai/docs-context.md"), "utf-8");

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

const CHAT_SYSTEM_PROMPT = `Tu es l'assistant de documentation d'EmailGo, une plateforme de prospection par email. Réponds aux questions des visiteurs de façon claire, concise et utile, en te basant UNIQUEMENT sur les informations ci-dessous.

Tu peux t'appuyer sur le bloc "Positionnement et avantages" pour répondre à des questions générales (ex: comparaison avec d'autres outils, pourquoi choisir EmailGo), même s'il n'est lié à aucune section précise de la doc.

Si la question ne concerne pas EmailGo ou si tu ne trouves pas la réponse dans ces informations, dis-le honnêtement plutôt que d'inventer une réponse, et propose de consulter la documentation complète ou de contacter le support.

Réponds dans la même langue que la question posée (français ou anglais). Reste bref (quelques phrases), sans formatage markdown superflu.

Chaque paragraphe lié à une page de doc commence par une balise [#id] indiquant la section correspondante. Termine TOUJOURS ta réponse par une dernière ligne EXACTEMENT au format :
SOURCES: #id1, #id2
en listant les identifiants (sans les crochets) des sections que tu as utilisées pour répondre, séparés par des virgules. N'inclus que des ids présents dans les informations ci-dessous. Si aucune section précise ne s'applique (ex: réponse basée sur le positionnement général), écris "SOURCES: none".

--- Informations sur EmailGo ---
${DOCS_CONTEXT}`;

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
