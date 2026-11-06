import { createPrivateKey } from "node:crypto";

const PEM_PATTERN =
  /-----BEGIN ([A-Z ]*PRIVATE KEY)-----([\s\S]*?)-----END \1-----/;

export function normalizePrivateKey(raw: string | undefined): string {
  if (!raw) return "";
  let key = raw.trim();

  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }

  if (key.startsWith("{")) {
    try {
      const parsed = JSON.parse(key) as { private_key?: string };
      if (parsed.private_key) key = parsed.private_key;
    } catch {}
  }

  key = key
    .replace(/\\\\r\\\\n|\\\\n/g, "\n")
    .replace(/\\r\\n|\\n/g, "\n")
    .replace(/\r\n?/g, "\n");

  const match = PEM_PATTERN.exec(key);
  if (!match) return key;

  const label = match[1];
  const body = match[2].replace(/[^A-Za-z0-9+/=]/g, "");
  const lines = body.match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----\n`;
}

export function privateKeyProblem(key: string): string | null {
  if (!key) return "GA4_PRIVATE_KEY فارغ.";
  if (!PEM_PATTERN.test(key)) {
    return "GA4_PRIVATE_KEY لا يحتوي على «-----BEGIN PRIVATE KEY-----» و«-----END PRIVATE KEY-----». انسخ قيمة private_key كاملة من ملف JSON الخاص بحساب الخدمة.";
  }
  try {
    createPrivateKey(key);
    return null;
  } catch {
    return "GA4_PRIVATE_KEY موجود لكنه تالف أو ناقص (تعذّر فكّ ترميزه). انسخ قيمة private_key من ملف JSON الخاص بحساب الخدمة من جديد دون تعديل.";
  }
}
