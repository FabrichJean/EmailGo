"use client";

import Link from "next/link";
import NavLinks from "./NavLinks";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import SidebarUser, { type SidebarUserInfo } from "./SidebarUser";
import { IconSend } from "./icons";
import { useI18n } from "./I18nProvider";

export default function Sidebar({ user, isAdmin }: { user: SidebarUserInfo; isAdmin?: boolean }) {
  const { dict } = useI18n();

  return (
    <>
      <div className="flex items-center gap-2 border-b border-border bg-surface p-3 md:hidden">
        <Link href="/" className="flex items-center gap-2">
          <span className="glow-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <IconSend className="h-4 w-4" />
          </span>
          <span className="font-semibold text-foreground">EmailGo</span>
        </Link>
      </div>

      <aside className="card hidden md:flex md:h-full md:w-64 md:shrink-0 md:flex-col md:justify-between md:p-4">
        <div className="flex flex-col gap-6">
          <Link href="/" className="flex items-center gap-3 px-2 py-1">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
              <IconSend className="h-4 w-4" />
            </span>
            <span className="font-semibold text-foreground">EmailGo</span>
          </Link>
          <NavLinks isAdmin={isAdmin} />
        </div>
        <div className="flex flex-col gap-3">
          <SidebarUser user={user} signOutLabel={dict.sidebar.signOut} />
          <div className="flex flex-col gap-1">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
