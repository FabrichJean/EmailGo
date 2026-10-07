import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isAdminEmail, verifyAdminPassword, unlockAdminSession } from "@/lib/auth/admin";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { password } = (await request.json()) as { password?: string };
  if (!password || !verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
  }

  await unlockAdminSession(session.userId);
  return NextResponse.json({ success: true });
}
