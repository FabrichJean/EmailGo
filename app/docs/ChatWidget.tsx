"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "../I18nProvider";
import { IconSend, IconTrash, IconSparkles, IconChevronRight } from "../icons";
import { NAV as NAV_FR } from "./content.fr";
import { NAV as NAV_EN } from "./content.en";

type Message = { role: "user" | "assistant"; content: string };

function flattenNav(nav: typeof NAV_FR): Record<string, string> {
  const map: Record<string, string> = {};
  for (const group of nav) {
    for (const item of group.items) {
      map[item.href.replace(/^#/, "")] = item.label;
    }
  }
  return map;
}

const SECTION_LABELS: Record<"fr" | "en", Record<string, string>> = {
  fr: flattenNav(NAV_FR),
  en: flattenNav(NAV_EN),
};

// Le modèle ignore parfois la consigne "pas de markdown" : on retire les marqueurs les
// plus visibles plutôt que de dépendre entièrement de son obéissance aux instructions.
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "• ");
}

// L'IA termine chaque réponse par "SOURCES: #id1, #id2" (voir lib/ai.ts) : on l'extrait
// du texte affiché pour la restituer comme liens cliquables vers la doc.
function extractSources(content: string): { text: string; sourceIds: string[] } {
  const match = content.match(/\n?SOURCES:\s*(.+?)\s*$/i);
  if (!match || match.index === undefined) return { text: content.trim(), sourceIds: [] };

  const text = content.slice(0, match.index).trim();
  const raw = match[1].trim();
  if (!raw || /^none$/i.test(raw)) return { text, sourceIds: [] };

  const ids = raw
    .split(",")
    .map((s) => s.trim().replace(/^#/, ""))
    .filter(Boolean);
  return { text, sourceIds: ids };
}

const SESSION_STORAGE_KEY = "emailgo-docs-chat-session";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

export default function ChatWidget() {
  const { dict, locale } = useI18n();
  const d = dict.docsChat;
  const sectionLabels = SECTION_LABELS[locale === "en" ? "en" : "fr"];
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  // Raccourci façon Spotlight/Command Menu : ⌘K ou Ctrl+K pour ouvrir/fermer, Échap pour fermer.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function sendMessage(content: string) {
    if (!content || sending) return;

    const nextMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setSending(true);

    try {
      const res = await fetch("/api/docs/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, sessionId: getSessionId(), locale }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(res.status === 429 ? d.rateLimited : (data.error ?? d.errorFallback));
        return;
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setError(d.errorFallback);
    } finally {
      setSending(false);
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    sendMessage(content);
  }

  function clearChat() {
    setMessages([]);
    setError(null);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        <IconSparkles className="animate-sparkle h-3.5 w-3.5 text-accent drop-shadow-[0_0_6px_var(--accent)]" />
        {d.triggerShort}
        <kbd className="ml-1 rounded border border-border px-1 text-[10px] text-zinc-500">⌘K</kbd>
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-[12vh]">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            <div className="card relative z-10 flex w-full max-w-xl flex-col overflow-hidden shadow-2xl">
            <form onSubmit={handleSend} className="flex items-center gap-3 border-b border-border p-4">
              <IconSparkles className="h-4 w-4 shrink-0 text-accent" />
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={d.placeholder}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-zinc-500 focus:outline-none"
              />
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearChat}
                  aria-label={d.clear}
                  title={d.clear}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-900"
                >
                  <IconTrash className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="submit"
                disabled={sending || !input.trim()}
                aria-label={d.send}
                className="glow-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50"
              >
                <IconSend className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={d.close}
                className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-900"
              >
                ✕
              </button>
            </form>

            <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-4">
              <div className="flex flex-col gap-3">
                <Bubble role="assistant">{d.greeting}</Bubble>
                {messages.length === 0 && (
                  <div className="flex flex-col items-start gap-1.5 pl-1">
                    {d.suggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => sendMessage(s)}
                        className="rounded-full border border-border px-3 py-1.5 text-left text-xs text-zinc-600 hover:border-accent hover:text-accent dark:text-zinc-400"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
                {messages.map((m, i) =>
                  m.role === "assistant" ? (
                    <AssistantBubble key={i} content={m.content} sectionLabels={sectionLabels} onNavigate={() => setOpen(false)} />
                  ) : (
                    <Bubble key={i} role="user">
                      {m.content}
                    </Bubble>
                  ),
                )}
                {sending && (
                  <Bubble role="assistant">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:150ms]" />
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-zinc-400 [animation-delay:300ms]" />
                    </span>
                  </Bubble>
                )}
                {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
              </div>
            </div>
          </div>
        </div>,
          document.body,
        )}
    </>
  );
}

function AssistantBubble({
  content,
  sectionLabels,
  onNavigate,
}: {
  content: string;
  sectionLabels: Record<string, string>;
  onNavigate: () => void;
}) {
  const { text, sourceIds } = extractSources(content);
  const links = sourceIds.filter((id) => sectionLabels[id]);

  return (
    <div className="flex justify-start">
      <div className="flex max-w-[90%] flex-col gap-2">
        <div className="rounded-2xl bg-zinc-100 px-3 py-2 text-sm whitespace-pre-wrap text-foreground dark:bg-zinc-900">
          {stripMarkdown(text)}
        </div>
        {links.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pl-1">
            {links.map((id) => (
              <a
                key={id}
                href={`/docs#${id}`}
                onClick={onNavigate}
                className="flex items-center gap-0.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent hover:bg-accent/15"
              >
                {sectionLabels[id]}
                <IconChevronRight className="h-3 w-3" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
          isUser ? "bg-accent text-accent-foreground" : "bg-zinc-100 text-foreground dark:bg-zinc-900"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
