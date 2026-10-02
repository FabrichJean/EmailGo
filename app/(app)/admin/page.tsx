import Link from "next/link";
import { requireAdminUnlocked } from "@/lib/auth/admin";
import { getServerDictionary } from "@/lib/i18n/server";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  await requireAdminUnlocked();
  const { dict } = await getServerDictionary();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{dict.admin.dashboard.title}</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{dict.admin.dashboard.subtitle}</p>
        </div>
        <Link
          href="/admin/docs-chat"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium whitespace-nowrap text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
        >
          {dict.admin.docsChat.navLabel}
        </Link>
      </div>
      <AdminDashboard />
    </div>
  );
}
