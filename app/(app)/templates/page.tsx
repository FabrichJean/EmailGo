"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "../../I18nProvider";

type Template = {
  id: string;
  name: string;
  subject: string;
  updatedAt: string;
};

export default function TemplatesPage() {
  const { dict } = useI18n();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/templates");
    const data = await res.json();
    setTemplates(data.templates ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm(dict.templates.deleteConfirm)) return;
    await fetch(`/api/templates/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{dict.templates.listTitle}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{dict.templates.listSubtitle}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/templates/library"
            className="w-fit rounded-md border border-border px-4 py-2 text-sm font-medium whitespace-nowrap text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            {dict.templates.library.browse}
          </Link>
          <Link
            href="/templates/new"
            className="w-fit rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium whitespace-nowrap text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {dict.templates.newTemplate}
          </Link>
        </div>
      </div>

      <section className="card p-5">
        {loading ? (
          <p className="text-sm text-zinc-500">{dict.templates.loading}</p>
        ) : templates.length === 0 ? (
          <p className="text-sm text-zinc-500">{dict.templates.noTemplates}</p>
        ) : (
          <ul className="divide-y divide-border">
            {templates.map((template) => (
              <li key={template.id}>
                <Link
                  href={`/templates/${template.id}`}
                  className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{template.name}</p>
                    <p className="truncate text-xs text-zinc-500">{template.subject}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(template.id);
                    }}
                    className="shrink-0 rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    {dict.templates.delete}
                  </button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
