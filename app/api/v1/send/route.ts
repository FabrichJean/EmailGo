import { NextRequest, NextResponse } from "next/server";
import { sendTemplatedEmail } from "@/lib/mailer";
import { authenticateApiKey } from "@/lib/auth/apiKey";

export async function POST(request: NextRequest) {
  const auth = await authenticateApiKey(request);
  if (!auth) {
    return NextResponse.json({ error: "Clé API invalide ou manquante" }, { status: 401 });
  }

  const { accountId, templateId, recipient, variables } = (await request.json()) as {
    accountId?: string;
    templateId?: string;
    recipient?: string;
    variables?: Record<string, string>;
  };

  if (!accountId || !recipient) {
    return NextResponse.json({ error: "accountId et recipient sont requis" }, { status: 400 });
  }

  const result = await sendTemplatedEmail({ userId: auth.userId, accountId, templateId, recipient, variables });

  if (result.status === "failed") {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
