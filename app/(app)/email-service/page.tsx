import { getServerDictionary } from "@/lib/i18n/server";
import { requireUser } from "@/lib/auth/session";
import ServicesManager from "./ServicesManager";

export default async function EmailServicePage() {
  await requireUser();
  const { dict } = await getServerDictionary();
  const d = dict.emailService;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{d.title}</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{d.subtitle}</p>
      </div>

      <ServicesManager />
    </div>
  );
}
