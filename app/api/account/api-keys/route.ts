import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { generateApiKey } from "@/lib/auth/apiKey";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const apiKeys = await prisma.apiKey.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, keyPrefix: true, createdAt: true, lastUsedAt: true },
  });
  return NextResponse.json({ apiKeys });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { name } = (await request.json()) as { name?: string };
  if (!name) {
    return NextResponse.json({ error: "name est requis" }, { status: 400 });
  }

  const { key, keyPrefix, keyHash } = generateApiKey();
  const apiKey = await prisma.apiKey.create({
    data: { userId: session.userId, name, keyPrefix, keyHash },
    select: { id: true, name: true, keyPrefix: true, createdAt: true, lastUsedAt: true },
  });

  return NextResponse.json({ apiKey, key });
}
