"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { IconHome, IconSend, IconLayout, IconPlug, IconHistory, IconMore, IconShield, IconCode } from "./icons";
import LanguageToggle from "./LanguageToggle";
import ThemeToggle from "./ThemeToggle";
import SidebarUser, { type SidebarUserInfo } from "./SidebarUser";
import { useI18n } from "./I18nProvider";

const TABS = [
  { href: "/", icon: IconHome },
  { href: "/send", icon: IconSend },
  { href: "/templates", icon: IconLayout },
  { href: "/connect", icon: IconPlug },
  { href: "/history", icon: IconHistory },
];

export default function MobileTabBar({ user, isAdmin }: { user: SidebarUserInfo; isAdmin?: boolean }) {
  const pathname = usePathname();
  const { dict } = useI18n();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      {settingsOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSettingsOpen(false)}
          aria-hidden="true"
        />
      )}

      {settingsOpen && (
        <div className="fixed right-3 bottom-20 left-3 z-50 flex flex-col gap-2 md:hidden">
          <SidebarUser user={user} signOutLabel={dict.sidebar.signOut} />
          <Link
            href="/email-service"
            onClick={() => setSettingsOpen(false)}
            className="card flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground"
          >
            <IconCode className="h-4 w-4 text-accent" />
            {dict.nav.emailService}
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setSettingsOpen(false)}
              className="card flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground"
            >
              <IconShield className="h-4 w-4 text-accent" />
              {dict.admin.navLabel}
            </Link>
          )}
          <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-2 shadow-lg">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
        {TABS.map((tab) => {
          const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={() => setSettingsOpen(false)}
              className="flex flex-1 flex-col items-center gap-1 py-3"
            >
              <Icon className={`h-6 w-6 ${active ? "text-accent" : "text-zinc-500"}`} />
              <span className={`h-1 w-1 rounded-full ${active ? "glow-accent bg-accent" : "bg-transparent"}`} />
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          aria-label={dict.sidebar.more}
          className="flex flex-1 flex-col items-center gap-1 py-3"
        >
          <IconMore className={`h-6 w-6 ${settingsOpen ? "text-accent" : "text-zinc-500"}`} />
          <span className={`h-1 w-1 rounded-full ${settingsOpen ? "glow-accent bg-accent" : "bg-transparent"}`} />
        </button>
      </nav>
    </>
  );
}
