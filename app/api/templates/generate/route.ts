import { NextRequest, NextResponse } from "next/server";
import { generateTemplate } from "@/lib/ai";
import { getSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { prompt, mode } = (await request.json()) as { prompt?: string; mode?: "text" | "html" };
  if (!prompt) {
    return NextResponse.json({ error: "prompt est requis" }, { status: 400 });
  }

  try {
    const template = await generateTemplate(prompt, mode === "html" ? "html" : "text");
    return NextResponse.json({ template });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error }, { status: 502 });
  }
}
