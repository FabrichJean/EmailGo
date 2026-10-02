"use client";

import { useEffect, useState } from "react";
import { useI18n } from "../../I18nProvider";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
};

export default function AccountApiKeys() {
  const { dict, locale } = useI18n();
  const d = dict.account.apiKeys;

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);

  async function loadApiKeys() {
    const res = await fetch("/api/account/api-keys");
    const data = await res.json();
    setApiKeys(data.apiKeys ?? []);
  }

  useEffect(() => {
    loadApiKeys();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/account/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setNewKey(data.key);
      setName("");
      await loadApiKeys();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm(d.revokeConfirm)) return;
    await fetch(`/api/account/api-keys/${id}`, { method: "DELETE" });
    if (newKey) setNewKey(null);
    await loadApiKeys();
  }

  return (
    <section className="card p-5">
      <h2 className="mb-1 font-medium text-foreground">{d.title}</h2>
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">{d.subtitle}</p>

      {newKey && (
        <div className="mb-4 flex flex-col gap-2 rounded-md bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-200">
          <p>{d.newKeyNotice}</p>
          <code className="break-all rounded bg-black/5 px-2 py-1 font-mono text-xs dark:bg-white/10">{newKey}</code>
        </div>
      )}

      <form onSubmit={handleCreate} className="mb-4 flex gap-2">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={d.namePlaceholder}
          className="input flex-1"
        />
        <button
          type="submit"
          disabled={submitting}
          className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {submitting ? d.creating : d.create}
        </button>
      </form>

      {apiKeys.length === 0 ? (
        <p className="text-sm text-zinc-500">{d.noKeys}</p>
      ) : (
        <ul className="divide-y divide-border">
          {apiKeys.map((apiKey) => (
            <li key={apiKey.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="text-zinc-800 dark:text-zinc-200">{apiKey.name}</p>
                <p className="text-xs text-zinc-500">
                  <code className="font-mono">{apiKey.keyPrefix}…</code>
                  {" · "}
                  {new Date(apiKey.createdAt).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR")}
                </p>
              </div>
              <button
                onClick={() => handleRevoke(apiKey.id)}
                className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {d.revoke}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
