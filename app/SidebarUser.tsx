import Image from "next/image";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";
import { IconLogout } from "./icons";

export type SidebarUserInfo = { email: string; name: string | null; avatarUrl: string | null };

export default function SidebarUser({
  user,
  signOutLabel,
}: {
  user: SidebarUserInfo;
  signOutLabel: string;
}) {
  const initials = (user.name || user.email).slice(0, 2).toUpperCase();

  return (
    <div className="card flex items-center gap-3 p-3">
      <Link href="/account" className="flex min-w-0 flex-1 items-center gap-3">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 shrink-0 rounded-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-medium text-accent">
            {initials}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{user.name || user.email}</p>
          <p className="truncate text-xs text-zinc-500">{user.email}</p>
        </div>
      </Link>
      <SignOutButton redirectUrl="/login">
        <button
          type="button"
          title={signOutLabel}
          className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-900"
        >
          <IconLogout className="h-4 w-4" />
        </button>
      </SignOutButton>
    </div>
  );
}
