"use client";

import { useState } from "react";
import CodeBlock, { type CodeLang } from "./CodeBlock";

type Snippet = { label: string; lang: CodeLang; code: string };

export default function CodeTabs({ snippets }: { snippets: Snippet[] }) {
  const [active, setActive] = useState(0);
  const current = snippets[active];

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <div className="flex gap-1 border-b border-border bg-zinc-50 p-1 dark:bg-zinc-900">
        {snippets.map((s, i) => (
          <button
            key={s.label}
            type="button"
            onClick={() => setActive(i)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              i === active
                ? "bg-accent/15 text-accent"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <CodeBlock code={current.code} lang={current.lang} bare />
    </div>
  );
}
