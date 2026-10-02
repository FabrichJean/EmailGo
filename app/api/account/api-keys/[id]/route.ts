import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const { count } = await prisma.apiKey.deleteMany({ where: { id, userId: session.userId } });
  if (count === 0) {
    return NextResponse.json({ error: "Clé API introuvable" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
