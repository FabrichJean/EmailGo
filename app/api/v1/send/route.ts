import { NextRequest, NextResponse } from "next/server";
import { sendTemplatedEmail } from "@/lib/mailer";
import { authenticateApiKey } from "@/lib/auth/apiKey";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: "Clé API invalide ou manquante" }, { status: 401 });
  }

  const { serviceId, templateId, recipient, variables } = (await request.json()) as {
    serviceId?: string;
    templateId?: string;
    recipient?: string;
    variables?: Record<string, string>;
  };

  if (!serviceId || !recipient) {
    return NextResponse.json({ error: "serviceId et recipient sont requis" }, { status: 400 });
  }

  const service = await prisma.service.findUnique({ where: { serviceId } });
  if (!service || service.userId !== auth.userId) {
    return NextResponse.json({ error: "Service introuvable" }, { status: 404 });
  }

  const result = await sendTemplatedEmail({
    userId: auth.userId,
    accountId: service.gmailAccountId,
    templateId,
    recipient,
    variables,
  });

  if (result.status === "failed") {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
