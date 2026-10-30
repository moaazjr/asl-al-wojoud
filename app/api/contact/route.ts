import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { json, errorResponse } from "@/lib/api-helpers";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sanitizeText, isLikelyEmail } from "@/lib/sanitize";
import { sendContactNotification } from "@/lib/email";

const MAX_NAME = 80;
const MAX_EMAIL = 160;
const MAX_SUBJECT = 100;
const MAX_TEXT = 3000;
const MIN_TEXT = 10;
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limited = rateLimit(`contact:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.ok)
    return errorResponse(
      "تم إرسال عدد كبير من الرسائل. يرجى المحاولة لاحقًا.",
      429,
    );

  const body = await req.json().catch(() => ({}));

  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ ok: true }, 201);
  }

  const name = sanitizeText(String(body.name ?? ""));
  const email = sanitizeText(String(body.email ?? ""));
  const subject = sanitizeText(String(body.subject ?? ""));
  const text = sanitizeText(String(body.message ?? body.text ?? ""));

  if (name.length < 2) return errorResponse("الاسم مطلوب.");
  if (name.length > MAX_NAME) return errorResponse("الاسم طويل جدًا.");
  if (!email) return errorResponse("البريد الإلكتروني مطلوب.");
  if (email.length > MAX_EMAIL)
    return errorResponse("البريد الإلكتروني طويل جدًا.");
  if (!isLikelyEmail(email))
    return errorResponse("البريد الإلكتروني غير صالح.");
  if (subject.length > MAX_SUBJECT)
    return errorResponse("الموضوع طويل جدًا.");
  if (text.length < MIN_TEXT) return errorResponse("نص الرسالة مطلوب.");
  if (text.length > MAX_TEXT)
    return errorResponse(`الرسالة طويلة جدًا (الحد ${MAX_TEXT} حرفًا).`);

  const chapter = subject ? `تواصل: ${subject}` : "تواصل";

  try {
    const row = await prisma.question.create({
      data: {
        name,
        email,
        chapter,
        text,
      },
    });

    try {
      await sendContactNotification({
        id: row.id,
        name: row.name,
        email: row.email ?? email,
        subject: subject || null,
        text: row.text,
        createdAt: row.createdAt,
      });
    } catch (err) {
      console.error("[contact] notification failed", err);
    }

    return json({ ok: true, id: row.id }, 201);
  } catch (err) {
    console.error("[contact] create failed", err);
    return errorResponse("تعذّر إرسال الرسالة. يرجى المحاولة مرة أخرى.", 500);
  }
}
