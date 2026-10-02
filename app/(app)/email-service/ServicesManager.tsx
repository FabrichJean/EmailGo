"use client";

import { useEffect, useRef, useState } from "react";
import Select from "../../Select";
import { useI18n } from "../../I18nProvider";
import { IconCode, IconTrash, IconCopy, IconCheck, IconEdit, IconMore } from "../../icons";

type Account = { id: string; email: string; isActive: boolean };
type Service = {
  id: string;
  name: string;
  serviceId: string;
  gmailAccountId: string;
  gmailAccount: { email: string };
};

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [hashPrefix, setHashPrefix] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [serviceIdTouched, setServiceIdTouched] = useState(false);
  const [gmailAccountId, setGmailAccountId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  function openCreateModal() {
    setEditingId(null);
    setHashPrefix(generateHashPrefix());
    setModalOpen(true);
  }

  function openEditModal(service: Service) {
    setEditingId(service.id);
    setName(service.name);
    setServiceId(service.serviceId);
    setServiceIdTouched(true);
    setGmailAccountId(service.gmailAccountId);
    setModalOpen(true);
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!serviceIdTouched) setServiceId(value ? `${slugify(value)}-${hashPrefix}` : "");
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
    setName("");
    setHashPrefix("");
    setServiceId("");
    setServiceIdTouched(false);
    setGmailAccountId("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(editingId ? `/api/services/${editingId}` : "/api/services", {
        method: editingId ? "PATCH" : "POST",
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

  async function handleCopy(value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedId(value);
    setTimeout(() => setCopiedId((current) => (current === value ? null : current)), 1500);
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
          onClick={openCreateModal}
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
              onClick={() => openEditModal(service)}
              className="group flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <IconCode className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{service.name}</p>
                <code className="block truncate font-mono text-[11px] text-zinc-500">{service.serviceId}</code>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <ServiceMenu
                  copied={copiedId === service.serviceId}
                  labels={d}
                  onCopy={() => handleCopy(service.serviceId)}
                  onEdit={() => openEditModal(service)}
                  onDelete={() => handleDelete(service.id)}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={closeModal} aria-hidden="true" />
          <div className="card relative z-10 w-full max-w-md p-5">
            <h3 className="mb-4 font-medium text-foreground">{editingId ? d.editModalTitle : d.modalTitle}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
                  {editingId ? (submitting ? d.saving : d.save) : submitting ? d.creating : d.create}
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

function ServiceMenu({
  copied,
  labels,
  onCopy,
  onEdit,
  onDelete,
}: {
  copied: boolean;
  labels: { copy: string; copied: string; edit: string; delete: string };
  onCopy: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`rounded-md p-1.5 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 ${
          open ? "bg-zinc-100 text-foreground opacity-100 dark:bg-zinc-800" : "text-zinc-400 opacity-0 hover:bg-zinc-100 hover:text-foreground dark:hover:bg-zinc-800"
        }`}
      >
        <IconMore className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute top-full right-0 z-20 mt-1 w-40 rounded-lg border border-border bg-surface p-1 shadow-lg">
          <button
            type="button"
            onClick={onCopy}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            {copied ? <IconCheck className="h-4 w-4 text-emerald-600" /> : <IconCopy className="h-4 w-4" />}
            {copied ? labels.copied : labels.copy}
          </button>
          <button
            type="button"
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <IconEdit className="h-4 w-4" />
            {labels.edit}
          </button>
          <button
            type="button"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          >
            <IconTrash className="h-4 w-4" />
            {labels.delete}
          </button>
        </div>
      )}
    </div>
  );
}
