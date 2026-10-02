import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const services = await prisma.service.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { gmailAccount: { select: { email: true } } },
  });
  return NextResponse.json({ services });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

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
  if (existing) {
    return NextResponse.json({ error: "Cet identifiant de service est déjà utilisé" }, { status: 409 });
  }

  const service = await prisma.service.create({
    data: { userId: session.userId, name, serviceId, gmailAccountId },
    include: { gmailAccount: { select: { email: true } } },
  });

  return NextResponse.json({ service });
}
