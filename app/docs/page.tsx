import type { Metadata } from "next";
import Link from "next/link";
import { IconSend, IconChevronRight } from "../icons";
import { getServerDictionary } from "@/lib/i18n/server";
import DocsLanguageToggle from "./DocsLanguageToggle";
import DocsContentFr, { NAV as NAV_FR, strings as strings_fr } from "./content.fr";
import DocsContentEn, { NAV as NAV_EN, strings as strings_en } from "./content.en";
import ChatWidget from "./ChatWidget";

export const metadata: Metadata = {
  title: "Documentation — EmailGo",
  description: "Guide complet d'EmailGo : comptes Gmail, templates, génération par IA, envoi, historique et API.",
};

export default async function DocsPage() {
  const { locale } = await getServerDictionary();
  const isEn = locale === "en";

  const NAV = isEn ? NAV_EN : NAV_FR;
  const strings = isEn ? strings_en : strings_fr;
  const DocsContent = isEn ? DocsContentEn : DocsContentFr;

  return (
    <div className="relative z-10 h-dvh overflow-y-auto scroll-smooth">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <a href="#demarrage" className="flex items-center gap-2">
            <span className="glow-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <IconSend className="h-4 w-4" />
            </span>
            <span className="font-semibold text-foreground">EmailGo</span>
            <span className="rounded-full border border-border px-2 py-0.5 text-xs text-zinc-500">
              {strings.docsBadge}
            </span>
          </a>
          <div className="flex items-center gap-2">
            <DocsLanguageToggle />
            <Link
              href="/"
              className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium whitespace-nowrap text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {strings.openApp}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-10 px-4 pt-10 pb-24 sm:px-6">
        {/* TOC */}
        <aside className="sticky top-20 hidden h-fit w-56 shrink-0 flex-col gap-6 lg:flex">
          {NAV.map((group) => (
            <div key={group.title}>
              <p className="mb-2 text-xs font-semibold tracking-wide text-zinc-500 uppercase">{group.title}</p>
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="block rounded-md px-2 py-1 text-sm text-zinc-600 hover:bg-zinc-100 hover:text-foreground dark:text-zinc-400 dark:hover:bg-zinc-900"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 space-y-20">
          <DocsContent />

          <div className="flex flex-col items-center gap-3 border-t border-border pt-10 text-center">
            <p className="text-sm text-zinc-500">{strings.readyTitle}</p>
            <Link
              href="/login"
              className="glow-accent flex items-center gap-1.5 rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:opacity-90"
            >
              {strings.openEmailGo}
              <IconChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
}
