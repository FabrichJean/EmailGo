import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getServerDictionary } from "@/lib/i18n/server";
import { requireUser } from "@/lib/auth/session";
import { interpolate } from "@/lib/i18n/interpolate";
import SendLimitBanner from "../../SendLimitBanner";
import AccountApiKeys from "./AccountApiKeys";

const INTL_LOCALE: Record<string, string> = { fr: "fr-FR", en: "en-US" };

export default async function AccountPage() {
  const user = await requireUser();
  const [{ dict, locale }, accountCount, templateCount, sentCount] = await Promise.all([
    getServerDictionary(),
    prisma.gmailAccount.count({ where: { userId: user.id, isActive: true } }),
    prisma.template.count({ where: { userId: user.id } }),
    prisma.sentEmail.count({ where: { userId: user.id } }),
  ]);

  const initials = (user.name || user.email).slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{dict.account.title}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{dict.account.subtitle}</p>
      </div>

      <div className="card flex items-center gap-4 p-5">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt=""
            width={64}
            height={64}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xl font-medium text-accent">
            {initials}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate text-lg font-medium text-foreground">{user.name || user.email}</p>
          <p className="truncate text-sm text-zinc-500">{user.email}</p>
          <p className="mt-1 text-xs text-zinc-500">
            {interpolate(dict.account.memberSince, {
              date: user.createdAt.toLocaleDateString(INTL_LOCALE[locale] ?? "fr-FR"),
            })}
          </p>
        </div>
      </div>

      <div className="card flex divide-x divide-border p-5">
        <Stat label={dict.account.statAccounts} value={accountCount} />
        <Stat label={dict.account.statTemplates} value={templateCount} />
        <Stat label={dict.account.statSent} value={sentCount} />
      </div>

      <SendLimitBanner />

      <AccountApiKeys />

      <form action="/api/auth/logout" method="POST">
        <button
          type="submit"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:border-red-200 hover:text-red-600 dark:text-zinc-400 dark:hover:border-red-900"
        >
          {dict.account.signOut}
        </button>
      </form>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-1 px-4 text-center first:pl-0 last:pr-0">
      <p className="text-2xl font-semibold text-foreground">{value}</p>
      <p className="text-xs text-zinc-500">{label}</p>
    </div>
  );
}
