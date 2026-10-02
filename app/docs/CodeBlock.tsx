import Prism from "prismjs";
import "prismjs/components/prism-bash.js";
import "prismjs/components/prism-json.js";
import "prismjs/components/prism-python.js";

export type CodeLang = "bash" | "javascript" | "python" | "json" | "markup";

const GRAMMARS: Record<CodeLang, { grammar: Prism.Grammar; name: string }> = {
  bash: { grammar: Prism.languages.bash, name: "bash" },
  javascript: { grammar: Prism.languages.javascript, name: "javascript" },
  python: { grammar: Prism.languages.python, name: "python" },
  json: { grammar: Prism.languages.json, name: "json" },
  markup: { grammar: Prism.languages.markup, name: "markup" },
};

export default function CodeBlock({
  code,
  lang = "bash",
  bare = false,
}: {
  code: string;
  lang?: CodeLang;
  /** Sans bordure/coin arrondi propres : pour un usage imbriqué dans un conteneur (ex. CodeTabs) qui gère déjà ce style. */
  bare?: boolean;
}) {
  const { grammar, name } = GRAMMARS[lang];
  const highlighted = Prism.highlight(code, grammar, name);

  return (
    <pre
      className={`code-highlight overflow-x-auto bg-zinc-50 p-3 text-xs dark:bg-zinc-900 ${
        bare ? "" : "rounded-md border border-border"
      }`}
    >
      <code className="font-mono" dangerouslySetInnerHTML={{ __html: highlighted }} />
    </pre>
  );
}
