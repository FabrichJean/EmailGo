"use client";

import { useRef } from "react";
import Prism from "prismjs";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

// Technique du textarea transparent superposé à un <pre> surligné : les deux calques
// partagent exactement la même police/espacement/retour à la ligne pour rester alignés
// pixel pour pixel, seul le textarea (invisible, texte transparent) reçoit la saisie.
export default function HtmlCodeEditor({ value, onChange, placeholder }: Props) {
  const preRef = useRef<HTMLPreElement>(null);

  const highlighted = Prism.highlight(value, Prism.languages.markup, "markup");

  function syncScroll(e: React.UIEvent<HTMLTextAreaElement>) {
    if (!preRef.current) return;
    preRef.current.scrollTop = e.currentTarget.scrollTop;
    preRef.current.scrollLeft = e.currentTarget.scrollLeft;
  }

  const sharedClass =
    "absolute inset-0 min-h-[280px] whitespace-pre-wrap break-words p-3 font-mono text-xs leading-5";

  return (
    <div className="code-highlight relative min-h-[280px] max-h-[500px] overflow-hidden">
      <pre ref={preRef} aria-hidden="true" className={`${sharedClass} m-0 overflow-auto pointer-events-none`}>
        <code dangerouslySetInnerHTML={{ __html: highlighted || "​" }} />
      </pre>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={syncScroll}
        spellCheck={false}
        placeholder={placeholder}
        style={{ caretColor: "var(--foreground)" }}
        className={`${sharedClass} resize-none overflow-auto bg-transparent text-transparent focus:outline-none`}
      />
    </div>
  );
}
