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

export async function generateTemplate(prompt: string, mode: "text" | "html" = "text"): Promise<GeneratedTemplate> {
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
      messages: [
        { role: "system", content: mode === "html" ? HTML_SYSTEM_PROMPT : TEXT_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      temperature: 0.6,
      max_tokens: 1024,
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

  return parseGeneratedTemplate(content);
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
