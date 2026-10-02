import { NextRequest, NextResponse } from "next/server";
import { sendTemplatedEmail } from "@/lib/mailer";
import { renderTemplate } from "@/lib/template";
import { getSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { accountId, recipient, subject, body, variables } = (await request.json()) as {
    accountId?: string;
    recipient?: string;
    subject?: string;
    body?: string;
    variables?: Record<string, string>;
  };

  if (!accountId || !recipient || !subject) {
    return NextResponse.json({ error: "accountId, recipient et subject sont requis" }, { status: 400 });
  }

  const vars = variables ?? {};
  const result = await sendTemplatedEmail({
    userId: session.userId,
    accountId,
    recipient,
    subject: renderTemplate(subject, vars),
    body: renderTemplate(body ?? "", vars),
  });

  if (result.status === "failed") {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ success: true });
}
