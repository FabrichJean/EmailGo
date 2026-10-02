"use client";

import { useEffect, useRef, useState } from "react";
import CodeBlock from "./CodeBlock";
import { IconPlay, IconTrash } from "../icons";
import { useI18n } from "../I18nProvider";
import { interpolate } from "@/lib/i18n/interpolate";

const STORAGE_KEY = "emailgo-docs-playground";

type VariableRow = { key: string; value: string };
type StoredFields = { apiKey: string; serviceId: string; templateId: string; recipient: string; variables: VariableRow[] };

const DEFAULT_VARIABLES: VariableRow[] = [{ key: "prenom", value: "Alex" }];

function loadStored(): StoredFields {
  const fallback: StoredFields = { apiKey: "", serviceId: "", templateId: "", recipient: "", variables: DEFAULT_VARIABLES };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function rowsToObject(rows: VariableRow[]): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const row of rows) {
    if (row.key.trim()) obj[row.key.trim()] = row.value;
  }
  return obj;
}

export default function Playground() {
  const { dict } = useI18n();
  const d = dict.docsPlayground;
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [recipient, setRecipient] = useState("");
  const [variables, setVariables] = useState<VariableRow[]>(DEFAULT_VARIABLES);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ status: number; body: string } | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  function openPlayground() {
    const stored = loadStored();
    setApiKey(stored.apiKey);
    setServiceId(stored.serviceId);
    setTemplateId(stored.templateId);
    setRecipient(stored.recipient);
    setVariables(stored.variables.length ? stored.variables : DEFAULT_VARIABLES);
    setOpen(true);
  }

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [result]);

  function persist(fields: Omit<StoredFields, "variables">) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...fields, variables }));
    } catch {
      // stockage indisponible (navigation privée...) : tant pis, pas bloquant.
    }
  }

  function updateRow(index: number, patch: Partial<VariableRow>) {
    setVariables((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  function removeRow(index: number) {
    setVariables((rows) => rows.filter((_, i) => i !== index));
  }

  function addRow() {
    setVariables((rows) => [...rows, { key: "", value: "" }]);
  }

  const requestPreview = JSON.stringify(
    { serviceId, templateId, recipient, variables: rowsToObject(variables) },
    null,
    2,
  );

  async function handleSend() {
    setError(null);
    setResult(null);

    if (!apiKey || !serviceId || !templateId || !recipient) {
      setError(d.missingFields);
      return;
    }

    persist({ apiKey, serviceId, templateId, recipient });
    setSending(true);
    try {
      const res = await fetch("/api/v1/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ serviceId, templateId, recipient, variables: rowsToObject(variables) }),
      });
      const data = await res.json();
      setResult({ status: res.status, body: JSON.stringify(data, null, 2) });
    } catch (err) {
      setError(err instanceof Error ? err.message : d.networkError);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openPlayground}
        className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
      >
        <IconPlay className="h-3.5 w-3.5 text-accent" />
        {d.trigger}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="card relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h3 className="flex items-center gap-2 font-medium text-foreground">
                <IconPlay className="h-4 w-4 text-accent" />
                {d.modalTitle}
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                aria-label={d.close}
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <p className="mb-4 text-xs text-zinc-500">
                {d.introBefore} <code className="rounded bg-accent/10 px-1 py-0.5 text-accent">/account</code>
                {d.introAfter}
              </p>

              <div className="flex flex-col gap-3">
                <Field label={d.apiKeyLabel}>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="eg_xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="input font-mono"
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Service ID">
                    <input
                      value={serviceId}
                      onChange={(e) => setServiceId(e.target.value)}
                      placeholder="notifications-support-a1b2c3d4"
                      className="input font-mono"
                    />
                  </Field>
                  <Field label="Template ID">
                    <input
                      value={templateId}
                      onChange={(e) => setTemplateId(e.target.value)}
                      placeholder="cmur4dgmz00003hjxwrbjymx8"
                      className="input font-mono"
                    />
                  </Field>
                </div>
                <Field label="Destinataire">
                  <input
                    type="email"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="destinataire@exemple.com"
                    className="input"
                  />
                </Field>

                <div className="flex flex-col gap-1.5">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">Variables</p>
                  <div className="overflow-hidden rounded-md border border-border">
                    <div className="grid grid-cols-[1fr_1fr_auto] gap-px bg-border text-xs font-medium text-zinc-500">
                      <span className="bg-zinc-50 px-2 py-1 dark:bg-zinc-900">Clé</span>
                      <span className="bg-zinc-50 px-2 py-1 dark:bg-zinc-900">Valeur</span>
                      <span className="bg-zinc-50 px-2 py-1 dark:bg-zinc-900" />
                    </div>
                    {variables.map((row, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_auto] items-center gap-px bg-border">
                        <input
                          value={row.key}
                          onChange={(e) => updateRow(i, { key: e.target.value })}
                          placeholder="prenom"
                          className="border-0 bg-surface px-2 py-1.5 font-mono text-xs text-foreground focus:outline-none"
                        />
                        <input
                          value={row.value}
                          onChange={(e) => updateRow(i, { value: e.target.value })}
                          placeholder="Alex"
                          className="border-0 bg-surface px-2 py-1.5 font-mono text-xs text-foreground focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeRow(i)}
                          aria-label="Supprimer la variable"
                          className="flex items-center justify-center bg-surface px-2 py-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                        >
                          <IconTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addRow}
                    className="w-fit rounded-md px-2 py-1 text-xs font-medium text-accent hover:bg-accent/10"
                  >
                    + Ajouter une variable
                  </button>
                </div>
              </div>

              <p className="mt-4 mb-1 text-xs font-medium text-zinc-500">Corps de la requête</p>
              <CodeBlock lang="json" code={requestPreview} />

              {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

              {result && (
                <div ref={resultRef} className="mt-4 scroll-mt-4">
                  <p
                    className={`mb-1 text-xs font-medium ${
                      result.status < 300 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    Réponse — HTTP {result.status}
                  </p>
                  <CodeBlock lang="json" code={result.body} />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-border p-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="glow-accent flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90 disabled:opacity-50"
              >
                <IconPlay className="h-3.5 w-3.5" />
                {sending ? "Envoi…" : "Envoyer la requête"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
      {label}
      {children}
    </label>
  );
}
