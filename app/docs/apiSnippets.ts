import type { CodeLang } from "./CodeBlock";

export const API_SNIPPETS: { label: string; lang: CodeLang; code: string }[] = [
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
];
