"use client";

import { useEffect, useState } from "react";
import Select from "../../Select";
import { useI18n } from "../../I18nProvider";
import { IconCode, IconTrash } from "../../icons";

type Account = { id: string; email: string; isActive: boolean };
type Service = { id: string; name: string; serviceId: string; gmailAccount: { email: string } };

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateHashPrefix(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}

export default function ServicesManager() {
  const { dict } = useI18n();
  const d = dict.emailService.services;

  const [services, setServices] = useState<Service[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [hashPrefix, setHashPrefix] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [serviceIdTouched, setServiceIdTouched] = useState(false);
  const [gmailAccountId, setGmailAccountId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadServices() {
    const res = await fetch("/api/services");
    const data = await res.json();
    setServices(data.services ?? []);
  }

  useEffect(() => {
    loadServices();
    fetch("/api/gmail/accounts")
      .then((r) => r.json())
      .then((data) => setAccounts((data.accounts ?? []).filter((a: Account) => a.isActive)));
  }, []);

  function openModal() {
    setHashPrefix(generateHashPrefix());
    setModalOpen(true);
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!serviceIdTouched) setServiceId(value ? `${slugify(value)}-${hashPrefix}` : "");
  }

  function closeModal() {
    setModalOpen(false);
    setName("");
    setHashPrefix("");
    setServiceId("");
    setServiceIdTouched(false);
    setGmailAccountId("");
    setError(null);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, serviceId, gmailAccountId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? d.unknownError);
        return;
      }
      closeModal();
      await loadServices();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(d.deleteConfirm)) return;
    await fetch(`/api/services/${id}`, { method: "DELETE" });
    await loadServices();
  }

  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-medium text-foreground">{d.title}</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{d.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={openModal}
          className="w-fit shrink-0 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium whitespace-nowrap text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {d.newService}
        </button>
      </div>

      {services.length === 0 ? (
        <p className="text-sm text-zinc-500">{d.noServices}</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {services.map((service) => (
            <li
              key={service.id}
              title={service.gmailAccount.email}
              className="group flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <IconCode className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{service.name}</p>
                <code className="block truncate font-mono text-[11px] text-zinc-500">{service.serviceId}</code>
              </div>
              <button
                onClick={() => handleDelete(service.id)}
                aria-label={d.delete}
                title={d.delete}
                className="shrink-0 rounded-md p-1.5 text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 focus:opacity-100 dark:hover:bg-red-900/20"
              >
                <IconTrash className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={closeModal} aria-hidden="true" />
          <div className="card relative z-10 w-full max-w-md p-5">
            <h3 className="mb-4 font-medium text-foreground">{d.modalTitle}</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-3">
              <Field label={d.nameLabel}>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={d.namePlaceholder}
                  className="input"
                />
              </Field>
              <Field label={d.serviceIdLabel}>
                <input
                  type="text"
                  required
                  value={serviceId}
                  onChange={(e) => {
                    setServiceIdTouched(true);
                    setServiceId(e.target.value);
                  }}
                  placeholder={d.serviceIdPlaceholder}
                  className="input font-mono"
                />
              </Field>
              <Field label={d.accountLabel}>
                <Select
                  value={gmailAccountId}
                  onChange={setGmailAccountId}
                  options={accounts.map((a) => ({ value: a.id, label: a.email }))}
                />
              </Field>

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

              <div className="mt-1 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  {d.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting || !gmailAccountId}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                >
                  {submitting ? d.creating : d.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
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
