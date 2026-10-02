import crypto from "node:crypto";

const KEY_PREFIX = "eg_";

export function generateApiKey(): { key: string; keyPrefix: string; keyHash: string } {
  const key = KEY_PREFIX + crypto.randomBytes(24).toString("hex");
  const keyPrefix = key.slice(0, KEY_PREFIX.length + 8);
  const keyHash = crypto.createHash("sha256").update(key).digest("hex");
  return { key, keyPrefix, keyHash };
}
