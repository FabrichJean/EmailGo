"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { extractVariables } from "@/lib/template";
import { useI18n } from "../../I18nProvider";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { IconDesktop, IconMobile, IconEdit, IconCode, IconLayout } from "../../icons";

type Props = {
  templateId?: string;
  initialName?: string;
  initialSubject?: string;
  initialBody?: string;
  initialCreatedAt?: string;
};

export default function TemplateForm({
  templateId,
  initialName,
  initialSubject,
  initialBody,
  initialCreatedAt,
}: Props) {
  const router = useRouter();
  const { dict, locale } = useI18n();
  const [tab, setTab] = useState<"content" | "settings">("content");
  const [name, setName] = useState(initialName ?? "");
  const [subject, setSubject] = useState(initialSubject ?? "");
  const [body, setBody] = useState(initialBody ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [bodyEditing, setBodyEditing] = useState(!initialBody);
  const [bodyMode, setBodyMode] = useState<"rich" | "html">("rich");
  const [previewWidth, setPreviewWidth] = useState<"desktop" | "mobile">("desktop");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
    ],
    content: initialBody ?? "",
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[280px] text-foreground",
      },
    },
    onUpdate: ({ editor }) => setBody(editor.getHTML()),
  });

  const variables = useMemo(() => extractVariables(subject, body), [subject, body]);
  const previewBody = useMemo(() => highlightVariables(body), [body]);

  function switchBodyMode(mode: "rich" | "html") {
    if (mode === bodyMode) return;
    if (mode === "rich") editor?.commands.setContent(body);
    setBodyMode(mode);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const url = templateId ? `/api/templates/${templateId}` : "/api/templates";
      const method = templateId ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subject, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? dict.templates.form.unknownError);
        return;
      }
      router.push("/templates");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!templateId) return;
    if (!confirm(dict.templates.deleteConfirm)) return;
    setDeleting(true);
    try {
      await fetch(`/api/templates/${templateId}`, { method: "DELETE" });
      router.push("/templates");
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">
          {templateId ? dict.templates.editTitle : dict.templates.newTitle}
        </h1>
        <button
          type="submit"
          form="template-form"
          disabled={submitting}
          className="glow-accent w-fit shrink-0 rounded-md bg-accent px-4 py-2 text-sm font-medium whitespace-nowrap text-accent-foreground hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? dict.templates.form.saving : dict.templates.form.save}
        </button>
      </div>

      <div className="flex gap-2 border-b border-border">
        <TabButton active={tab === "content"} onClick={() => setTab("content")}>
          {dict.templates.form.tabContent}
        </TabButton>
        <TabButton active={tab === "settings"} onClick={() => setTab("settings")}>
          {dict.templates.form.tabSettings}
        </TabButton>
      </div>

      <form
        id="template-form"
        onSubmit={handleSubmit}
        className={tab === "content" ? "card flex max-w-2xl flex-col gap-3 p-5" : "hidden"}
      >
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          {dict.templates.form.nameLabel}
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder={dict.templates.form.namePlaceholder}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          {dict.templates.form.subjectLabel}
          <input
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input"
            placeholder={dict.templates.form.subjectPlaceholder}
          />
        </label>
        <div className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
          {dict.templates.form.bodyLabel}
          <div className="overflow-hidden rounded-md border border-border">
            <div className="flex items-center justify-between gap-2 border-b border-border bg-zinc-50 p-1 dark:bg-zinc-900">
              <div className="flex items-center gap-1">
                {bodyEditing ? (
                  <>
                    <ViewToggleButton active={bodyMode === "rich"} onClick={() => switchBodyMode("rich")} icon={IconLayout}>
                      {dict.templates.form.visualTab}
                    </ViewToggleButton>
                    <ViewToggleButton active={bodyMode === "html"} onClick={() => switchBodyMode("html")} icon={IconCode}>
                      {dict.templates.form.htmlTab}
                    </ViewToggleButton>
                  </>
                ) : (
                  <>
                    <ViewToggleButton
                      active={previewWidth === "desktop"}
                      onClick={() => setPreviewWidth("desktop")}
                      icon={IconDesktop}
                    >
                      {dict.templates.form.desktopTab}
                    </ViewToggleButton>
                    <ViewToggleButton
                      active={previewWidth === "mobile"}
                      onClick={() => setPreviewWidth("mobile")}
                      icon={IconMobile}
                    >
                      {dict.templates.form.mobileTab}
                    </ViewToggleButton>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setBodyEditing((v) => !v)}
                className="flex items-center gap-1.5 rounded px-2 py-1 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <IconEdit className="h-3.5 w-3.5" />
                {bodyEditing ? dict.templates.form.doneEditing : dict.templates.form.editContent}
              </button>
            </div>

            {bodyEditing ? (
              bodyMode === "html" ? (
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  spellCheck={false}
                  className="min-h-[280px] w-full resize-y bg-transparent p-3 font-mono text-xs text-foreground focus:outline-none"
                  placeholder="<p>Bonjour {{prenom}}</p>"
                />
              ) : (
                <>
                  <EditorToolbar editor={editor} dict={dict} />
                  <EditorContent
                    editor={editor}
                    className="min-h-[280px] p-3 focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-accent [&_.tiptap]:outline-none"
                  />
                </>
              )
            ) : !body ? (
              <p className="p-6 text-center text-sm text-zinc-500">{dict.templates.form.previewEmpty}</p>
            ) : (
              <div className="bg-zinc-100 p-4 dark:bg-zinc-950">
                <div
                  className={`mx-auto overflow-hidden rounded-md border border-border bg-surface transition-all ${
                    previewWidth === "mobile" ? "max-w-[375px]" : "max-w-full"
                  }`}
                >
                  <IframePreview html={previewBody} />
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-xs text-zinc-500">{dict.templates.form.helpText}</p>
        {variables.length > 0 && (
          <p className="text-xs text-zinc-500">
            {dict.templates.form.variablesDetected} {variables.map((v) => `{{${v}}}`).join(", ")}
          </p>
        )}
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </form>

      <div className={tab === "settings" ? "flex max-w-2xl flex-col gap-4" : "hidden"}>
        {!templateId ? (
          <p className="card p-5 text-sm text-zinc-500">{dict.templates.form.settings.newNotice}</p>
        ) : (
          <>
            <section className="card flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-zinc-500">{dict.templates.form.settings.nameLabel}</span>
                <span className="truncate text-foreground">{name}</span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="shrink-0 text-zinc-500">{dict.templates.form.settings.idLabel}</span>
                <code className="truncate font-mono text-xs text-foreground">{templateId}</code>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">{dict.templates.form.settings.createdLabel}</span>
                <span className="text-foreground">{formatDate(initialCreatedAt, locale)}</span>
              </div>
            </section>

            <section className="card flex flex-col gap-3 border-red-200 p-5 dark:border-red-900">
              <h2 className="font-medium text-red-600 dark:text-red-400">{dict.templates.form.settings.dangerTitle}</h2>
              <p className="text-sm text-zinc-500">{dict.templates.form.settings.dangerDescription}</p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="w-fit rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                {dict.templates.form.settings.deleteButton}
              </button>
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function formatDate(value: string | undefined, locale: string): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
        active
          ? "border-accent text-accent"
          : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      }`}
    >
      {children}
    </button>
  );
}

function ViewToggleButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: (props: { className?: string }) => React.ReactElement;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded px-2 py-1 text-sm font-medium ${
        active ? "bg-accent/15 text-accent" : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {children}
    </button>
  );
}

// Styles en ligne plutôt que classes Tailwind : ce HTML est injecté dans l'iframe
// de prévisualisation (document isolé, sans accès au CSS de l'app) ou envoyé tel
// quel par email, aucun des deux contextes ne voit les classes Tailwind de l'app.
function highlightVariables(html: string): string {
  return html.replace(
    /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
    (_match, key: string) =>
      `<span style="background:rgba(244,63,94,0.15);color:#e11d48;padding:1px 4px;border-radius:4px;font-family:ui-monospace,monospace;font-size:0.85em;">{{${key}}}</span>`,
  );
}

function IframePreview({ html }: { html: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(40);

  useEffect(() => {
    const iframe = ref.current;
    if (!iframe) return;

    let observer: ResizeObserver | null = null;

    function measure() {
      const body = iframe?.contentDocument?.body;
      if (!body) return;
      setHeight(body.scrollHeight);
      // Le contenu peut encore changer de hauteur sans nouveau "load" (ex: le cadre
      // bureau/mobile se rétrécit et le texte se remet à la ligne) : on observe le body.
      observer?.disconnect();
      observer = new ResizeObserver(() => setHeight(body.scrollHeight));
      observer.observe(body);
    }

    // Le document srcDoc peut déjà être chargé au moment où cet effet s'exécute
    // (chargement quasi instantané) : l'événement "load" serait alors manqué si
    // on ne vérifiait pas aussi l'état actuel directement.
    if (iframe.contentDocument?.readyState === "complete") measure();
    iframe.addEventListener("load", measure);
    return () => {
      iframe.removeEventListener("load", measure);
      observer?.disconnect();
    };
  }, [html]);

  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><style>
    body { margin: 0; padding: 16px; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 14px; color: #18181b; }
    @media (prefers-color-scheme: dark) { body { color: #f4f4f5; } }
  </style></head><body>${html}</body></html>`;

  return (
    <iframe
      ref={ref}
      srcDoc={srcDoc}
      sandbox="allow-same-origin"
      title="Aperçu du template"
      style={{ height, border: "none", width: "100%", display: "block" }}
    />
  );
}

function EditorToolbar({ editor, dict }: { editor: Editor | null; dict: Dictionary }) {
  function insertLink() {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt(dict.templates.form.toolbar.linkPrompt, previousUrl ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  const buttons: { title: string; label: React.ReactNode; active?: boolean; onClick: () => void }[] = [
    {
      title: dict.templates.form.toolbar.bold,
      label: <span className="font-bold">G</span>,
      active: editor?.isActive("bold"),
      onClick: () => editor?.chain().focus().toggleBold().run(),
    },
    {
      title: dict.templates.form.toolbar.italic,
      label: <span className="italic">I</span>,
      active: editor?.isActive("italic"),
      onClick: () => editor?.chain().focus().toggleItalic().run(),
    },
    {
      title: dict.templates.form.toolbar.underline,
      label: <span className="underline">S</span>,
      active: editor?.isActive("underline"),
      onClick: () => editor?.chain().focus().toggleUnderline().run(),
    },
    {
      title: dict.templates.form.toolbar.heading,
      label: "H2",
      active: editor?.isActive("heading", { level: 2 }),
      onClick: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      title: dict.templates.form.toolbar.bulletList,
      label: "•⃝",
      active: editor?.isActive("bulletList"),
      onClick: () => editor?.chain().focus().toggleBulletList().run(),
    },
    {
      title: dict.templates.form.toolbar.orderedList,
      label: "1.",
      active: editor?.isActive("orderedList"),
      onClick: () => editor?.chain().focus().toggleOrderedList().run(),
    },
    {
      title: dict.templates.form.toolbar.link,
      label: dict.templates.form.toolbar.link,
      active: editor?.isActive("link"),
      onClick: insertLink,
    },
  ];

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-border bg-zinc-50 p-1 dark:bg-zinc-900">
      {buttons.map((b) => (
        <button
          key={b.title}
          type="button"
          title={b.title}
          onMouseDown={(e) => e.preventDefault()}
          onClick={b.onClick}
          className={`min-w-7 rounded px-2 py-1 text-sm font-medium transition-colors ${
            b.active
              ? "bg-accent/15 text-accent"
              : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {b.label}
        </button>
      ))}
      <span className="mx-1 h-5 w-px bg-border" />
      <button
        type="button"
        title={dict.templates.form.toolbar.undo}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor?.chain().focus().undo().run()}
        className="rounded px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        ↶
      </button>
      <button
        type="button"
        title={dict.templates.form.toolbar.redo}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor?.chain().focus().redo().run()}
        className="rounded px-2 py-1 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        ↷
      </button>
    </div>
  );
}
