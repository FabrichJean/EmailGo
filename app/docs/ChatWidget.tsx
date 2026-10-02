"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "../I18nProvider";
import { IconSend, IconTrash, IconSparkles } from "../icons";

type Message = { role: "user" | "assistant"; content: string };

// Le modèle ignore parfois la consigne "pas de markdown" : on retire les marqueurs les
// plus visibles plutôt que de dépendre entièrement de son obéissance aux instructions.
function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/(?<!\*)\*(?!\*)(.*?)\*(?!\*)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*]\s+/gm, "• ");
}

export default function ChatWidget() {
  const { dict } = useI18n();
  const d = dict.docsChat;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
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
        body: JSON.stringify({ messages: nextMessages }),
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

  function clearChat() {
    setMessages([]);
    setError(null);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="glow-accent flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium whitespace-nowrap text-accent-foreground hover:opacity-90"
      >
        <IconSparkles className="h-4 w-4" />
        {d.triggerShort}
      </button>

      {open && (
        <div className="card absolute top-full right-0 z-30 mt-2 flex h-[32rem] max-h-[70vh] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden shadow-xl">
          <div className="flex items-center justify-between border-b border-border p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <IconSparkles className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-sm font-medium text-foreground">{d.title}</p>
                <p className="text-xs text-zinc-500">{d.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
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
                type="button"
                onClick={() => setOpen(false)}
                aria-label={d.close}
                className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-900"
              >
                ✕
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 overflow-y-auto p-3">
            <div className="flex flex-col gap-3">
              <Bubble role="assistant">{d.greeting}</Bubble>
              {messages.map((m, i) => (
                <Bubble key={i} role={m.role}>
                  {m.role === "assistant" ? stripMarkdown(m.content) : m.content}
                </Bubble>
              ))}
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

          <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={d.placeholder}
              className="input flex-1"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label={d.send}
              className="glow-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground hover:opacity-90 disabled:opacity-50"
            >
              <IconSend className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Bubble({ role, children }: { role: "user" | "assistant"; children: React.ReactNode }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
          isUser ? "bg-accent text-accent-foreground" : "bg-zinc-100 text-foreground dark:bg-zinc-900"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
