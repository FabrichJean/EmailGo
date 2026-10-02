"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconHome, IconPlug, IconLayout, IconSend, IconHistory, IconShield, IconCode, IconBook } from "./icons";
import { useI18n } from "./I18nProvider";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const NAV_LINKS: { href: string; label: (dict: Dictionary) => string; icon: typeof IconHome }[] = [
  { href: "/", label: (dict) => dict.nav.dashboard, icon: IconHome },
  { href: "/send", label: (dict) => dict.nav.send, icon: IconSend },
  { href: "/email-service", label: (dict) => dict.nav.emailService, icon: IconCode },
  { href: "/templates", label: (dict) => dict.nav.templates, icon: IconLayout },
  { href: "/connect", label: (dict) => dict.nav.connect, icon: IconPlug },
  { href: "/history", label: (dict) => dict.nav.history, icon: IconHistory },
];

export default function NavLinks({ isAdmin = false }: { isAdmin?: boolean } = {}) {
  const pathname = usePathname();
  const { dict } = useI18n();

  const links = isAdmin
    ? [...NAV_LINKS, { href: "/admin", label: (d: Dictionary) => d.admin.navLabel, icon: IconShield }]
    : NAV_LINKS;

  return (
    <nav className="flex flex-col gap-3">
      {links.map((link) => {
        const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors ${
              active
                ? "bg-accent/15 text-accent"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
            }`}
          >
            <Icon />
            {link.label(dict)}
          </Link>
        );
      })}
      <a
        href="/docs"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900"
      >
        <IconBook />
        {dict.nav.docs}
      </a>
    </nav>
  );
}
