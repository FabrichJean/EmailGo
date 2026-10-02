import { requireAdminUnlocked } from "@/lib/auth/admin";
import { getServerDictionary } from "@/lib/i18n/server";
import DocsChatAdmin from "./DocsChatAdmin";

export default async function AdminDocsChatPage() {
  await requireAdminUnlocked();
  const { dict } = await getServerDictionary();
  const d = dict.admin.docsChat;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{d.title}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{d.subtitle}</p>
      </div>
      <DocsChatAdmin />
    </div>
  );
}
