import { NextRequest, NextResponse } from "next/server";
import { answerDocsQuestion, type ChatMessage } from "@/lib/ai";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 1000;
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!checkRateLimit(`docs-chat:${ip}`, RATE_LIMIT, RATE_WINDOW_MS)) {
    return NextResponse.json({ error: "Trop de questions, réessaie dans quelques minutes." }, { status: 429 });
  }

  const { messages, sessionId, locale } = (await request.json()) as {
    messages?: ChatMessage[];
    sessionId?: string;
    locale?: string;
  };
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "messages est requis" }, { status: 400 });
  }
  if (messages.length > MAX_MESSAGES) {
    return NextResponse.json({ error: "Conversation trop longue" }, { status: 400 });
  }
  for (const m of messages) {
    if (
      (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string" ||
      m.content.length === 0 ||
      m.content.length > MAX_MESSAGE_LENGTH
    ) {
      return NextResponse.json({ error: "Message invalide" }, { status: 400 });
    }
  }

  try {
    const reply = await answerDocsQuestion(messages);

    // Historisation best-effort : une conversation par sessionId (généré côté client),
    // on n'enregistre à chaque appel que le dernier message utilisateur + la réponse,
    // le reste de l'historique envoyé au modèle est déjà en base depuis les tours précédents.
    if (sessionId) {
      const lastUserMessage = messages[messages.length - 1];
      await prisma.docsChatConversation
        .upsert({
          where: { sessionId },
          create: { sessionId, ip, locale },
          update: { updatedAt: new Date() },
        })
        .then((conversation) =>
          prisma.docsChatMessage.createMany({
            data: [
              { conversationId: conversation.id, role: "user", content: lastUserMessage.content },
              { conversationId: conversation.id, role: "assistant", content: reply },
            ],
          }),
        )
        .catch(() => {
          // L'historisation ne doit jamais faire échouer la réponse au visiteur.
        });
    }

    return NextResponse.json({ reply });
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error }, { status: 502 });
  }
}
