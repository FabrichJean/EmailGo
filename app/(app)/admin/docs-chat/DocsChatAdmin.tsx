"use client";

import { useEffect, useState } from "react";
import { useI18n } from "../../../I18nProvider";
import { IconChevronRight, IconTrash } from "../../../icons";

type ConversationSummary = {
  id: string;
  ip: string | null;
  locale: string | null;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  firstMessage: string;
};

type ConversationDetail = {
  id: string;
  ip: string | null;
  locale: string | null;
  createdAt: string;
  messages: { id: string; role: string; content: string; createdAt: string }[];
};

const INTL_LOCALE: Record<string, string> = { fr: "fr-FR", en: "en-US" };

export default function DocsChatAdmin() {
  const { dict, locale } = useI18n();
  const d = dict.admin.docsChat;
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);

  async function load() {
    const res = await fetch("/api/admin/docs-chat");
    const data = await res.json();
    setConversations(data.conversations ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  function openConversation(id: string) {
    setSelectedId(id);
    setDetail(null);
    fetch(`/api/admin/docs-chat/${id}`)
      .then((r) => r.json())
      .then((data) => setDetail(data.conversation ?? null));
  }

  function closeConversation() {
    setSelectedId(null);
    setDetail(null);
  }

  async function handleDelete(id: string) {
    if (!confirm(d.deleteConfirm)) return;
    await fetch(`/api/admin/docs-chat/${id}`, { method: "DELETE" });
    if (selectedId === id) closeConversation();
    await load();
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString(INTL_LOCALE[locale] ?? "fr-FR");
  }

  if (selectedId) {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={closeConversation}
          className="flex w-fit items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          <IconChevronRight className="h-4 w-4 rotate-180" />
          {d.back}
        </button>

        {!detail ? (
          <p className="text-sm text-zinc-500">{d.loading}</p>
        ) : (
          <section className="card flex flex-col gap-4 p-5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
              <span>{formatDate(detail.createdAt)}</span>
              {detail.locale && <span>{detail.locale}</span>}
              {detail.ip && <span>{detail.ip}</span>}
            </div>
            <div className="flex flex-col gap-3">
              {detail.messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-accent text-accent-foreground"
                        : "bg-zinc-100 text-foreground dark:bg-zinc-900"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <section className="card p-5">
      {conversations === null ? (
        <p className="text-sm text-zinc-500">{d.loading}</p>
      ) : conversations.length === 0 ? (
        <p className="text-sm text-zinc-500">{d.noConversations}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs text-zinc-500 uppercase">
              <tr>
                <th className="px-3 py-2">{d.colFirstMessage}</th>
                <th className="px-3 py-2">{d.colMessages}</th>
                <th className="px-3 py-2">{d.colLocale}</th>
                <th className="px-3 py-2">{d.colIp}</th>
                <th className="px-3 py-2">{d.colDate}</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {conversations.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => openConversation(c.id)}
                  className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <td className="max-w-xs truncate px-3 py-2 text-foreground">{c.firstMessage}</td>
                  <td className="px-3 py-2 text-zinc-500">{c.messageCount}</td>
                  <td className="px-3 py-2 text-zinc-500">{c.locale ?? "—"}</td>
                  <td className="px-3 py-2 text-zinc-500">{c.ip ?? "—"}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-zinc-500">{formatDate(c.updatedAt)}</td>
                  <td className="px-3 py-2 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(c.id);
                      }}
                      aria-label={d.delete}
                      className="rounded-md p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
