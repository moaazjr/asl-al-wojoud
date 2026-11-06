import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  json,
  errorResponse,
  requireAdmin,
} from "@/lib/api-helpers";
import { mapQuestion } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sanitizeText, isLikelyEmail } from "@/lib/sanitize";
import { sendQuestionNotification } from "@/lib/email";

const MAX_NAME = 80;
const MAX_EMAIL = 160;
const MAX_CHAPTER = 120;
const MAX_TEXT = 3000;
const MIN_TEXT = 10;
const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return errorResponse("غير مصرّح", 403);

  const rows = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
  });
  return json(rows.map(mapQuestion));
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limited = rateLimit(`question:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.ok)
    return errorResponse(
      "تم إرسال عدد كبير من الأسئلة. يرجى المحاولة لاحقًا.",
      429,
    );

  const body = await req.json().catch(() => ({}));

  if (typeof body.hp_field === "string" && body.hp_field.trim() !== "") {
    return json({ ok: true }, 201);
  }

  const name = sanitizeText(String(body.name ?? ""));
  const email = sanitizeText(String(body.email ?? ""));
  const chapter = sanitizeText(String(body.chapter ?? ""));
  const text = sanitizeText(String(body.question ?? body.text ?? ""));

  if (name.length < 2) return errorResponse("الاسم مطلوب.");
  if (name.length > MAX_NAME) return errorResponse("الاسم طويل جدًا.");
  if (email.length > MAX_EMAIL)
    return errorResponse("البريد الإلكتروني طويل جدًا.");
  if (email && !isLikelyEmail(email))
    return errorResponse("البريد الإلكتروني غير صالح.");
  if (chapter.length > MAX_CHAPTER)
    return errorResponse("رقم الفصل طويل جدًا.");
  if (text.length < MIN_TEXT) return errorResponse("السؤال مطلوب.");
  if (text.length > MAX_TEXT)
    return errorResponse(`السؤال طويل جدًا (الحد ${MAX_TEXT} حرفًا).`);

  try {
    const row = await prisma.question.create({
      data: {
        name,
        email: email || null,
        chapter: chapter || null,
        text,
      },
    });

    try {
      await sendQuestionNotification({
        id: row.id,
        name: row.name,
        email: row.email,
        chapter: row.chapter,
        text: row.text,
        createdAt: row.createdAt,
      });
    } catch (err) {
      console.error("[questions] notification failed", err);
    }

    return json({ ok: true, id: row.id }, 201);
  } catch (err) {
    console.error("[questions] create failed", err);
    return errorResponse(
      "تعذّر إرسال السؤال. يرجى المحاولة مرة أخرى.",
      500,
    );
  }
}
