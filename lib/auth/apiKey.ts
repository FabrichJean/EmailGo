import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

const KEY_PREFIX = "eg_";

export function generateApiKey(): { key: string; keyPrefix: string; keyHash: string } {
  const key = KEY_PREFIX + crypto.randomBytes(24).toString("hex");
  const keyPrefix = key.slice(0, KEY_PREFIX.length + 8);
  const keyHash = crypto.createHash("sha256").update(key).digest("hex");
  return { key, keyPrefix, keyHash };
}

export async function authenticateApiKey(request: Request): Promise<{ userId: string } | null> {
  const header = request.headers.get("authorization") ?? "";
  const key = header.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;
  if (!key || !key.startsWith(KEY_PREFIX)) return null;

  const keyHash = crypto.createHash("sha256").update(key).digest("hex");
  const apiKey = await prisma.apiKey.findUnique({ where: { keyHash } });
  if (!apiKey) return null;

  await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } });
  return { userId: apiKey.userId };
}
