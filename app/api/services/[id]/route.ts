import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const { name, serviceId, gmailAccountId } = (await request.json()) as {
    name?: string;
    serviceId?: string;
    gmailAccountId?: string;
  };

  if (!name || !serviceId || !gmailAccountId) {
    return NextResponse.json({ error: "name, serviceId et gmailAccountId sont requis" }, { status: 400 });
  }

  const account = await prisma.gmailAccount.findFirst({ where: { id: gmailAccountId, userId: session.userId } });
  if (!account) {
    return NextResponse.json({ error: "Compte Gmail introuvable" }, { status: 400 });
  }

  const existing = await prisma.service.findUnique({ where: { serviceId } });
  if (existing && existing.id !== id) {
    return NextResponse.json({ error: "Cet identifiant de service est déjà utilisé" }, { status: 409 });
  }

  const { count } = await prisma.service.updateMany({
    where: { id, userId: session.userId },
    data: { name, serviceId, gmailAccountId },
  });
  if (count === 0) {
    return NextResponse.json({ error: "Service introuvable" }, { status: 404 });
  }

  const service = await prisma.service.findUnique({
    where: { id },
    include: { gmailAccount: { select: { email: true } } },
  });
  return NextResponse.json({ service });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { id } = await params;
  const { count } = await prisma.service.deleteMany({ where: { id, userId: session.userId } });
  if (count === 0) {
    return NextResponse.json({ error: "Service introuvable" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
