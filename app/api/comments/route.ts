import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { json, errorResponse, requireAdmin } from "@/lib/api-helpers";
import { mapPublicComment } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sanitizeText, isLikelyEmail } from "@/lib/sanitize";
import { sendPendingCommentNotification } from "@/lib/email";

type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED";

const MODERATION_STATUSES: ModerationStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
];

const MAX_NAME = 80;
const MAX_EMAIL = 160;
const MAX_TEXT = 2000;
const MIN_TEXT = 2;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sectionId = url.searchParams.get("sectionId");
  const status = url.searchParams.get("status");

  if (sectionId && !status) {
    const rows = await prisma.publicComment.findMany({
      where: { sectionId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
    });
    return json(rows.map(mapPublicComment));
  }

  const admin = await requireAdmin();
  if (!admin) return errorResponse("غير مصرّح", 403);

  const where: Prisma.PublicCommentWhereInput = {};
  if (status) {
    const normalized = status.toUpperCase() as ModerationStatus;
    if (!MODERATION_STATUSES.includes(normalized)) {
      return errorResponse("حالة التعليق غير صالحة.", 400);
    }
    where.status = normalized;
  }

  const rows = await prisma.publicComment.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return json(rows.map(mapPublicComment));
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limited = rateLimit(`public-comment:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.ok) {
    return errorResponse(
      "لقد أرسلت تعليقات كثيرة خلال وقت قصير. يرجى المحاولة بعد قليل.",
      429,
    );
  }

  const body = await req.json().catch(() => ({}));

  if (typeof body.website === "string" && body.website.trim() !== "") {
    return json({ ok: true, status: "pending" }, 201);
  }

  const sectionId = sanitizeText(String(body.sectionId ?? ""));
  const sectionTitle = sanitizeText(String(body.sectionTitle ?? ""));
  const bookTitle = sanitizeText(String(body.bookTitle ?? ""));
  const name = sanitizeText(String(body.name ?? ""));
  const email = sanitizeText(String(body.email ?? ""));
  const text = sanitizeText(String(body.text ?? ""));

  if (!sectionId) return errorResponse("معرّف المبحث مطلوب.");
  if (!name) return errorResponse("يرجى إدخال الاسم.");
  if (name.length > MAX_NAME) return errorResponse("الاسم طويل جدًا.");
  if (!text) return errorResponse("يرجى كتابة التعليق.");
  if (text.length < MIN_TEXT) return errorResponse("التعليق قصير جدًا.");
  if (text.length > MAX_TEXT)
    return errorResponse(`التعليق طويل جدًا (الحد ${MAX_TEXT} حرف).`);
  if (email && email.length > MAX_EMAIL)
    return errorResponse("البريد الإلكتروني طويل جدًا.");
  if (email && !isLikelyEmail(email))
    return errorResponse("البريد الإلكتروني غير صالح.");

  let row;
  try {
    row = await prisma.publicComment.create({
      data: {
        sectionId,
        sectionTitle,
        bookTitle,
        name,
        email: email || null,
        text,
        status: "PENDING",
      },
    });
  } catch (err) {
    console.error("[comments] create failed", err);
    return errorResponse("فشل حفظ التعليق. يرجى المحاولة مرة أخرى.", 500);
  }

  try {
    await sendPendingCommentNotification({
      id: row.id,
      name: row.name,
      email: row.email,
      text: row.text,
      sectionId: row.sectionId,
      sectionTitle: row.sectionTitle,
      bookTitle: row.bookTitle,
      createdAt: row.createdAt,
    });
  } catch (err) {
    console.error("[comments] notification failed", err);
  }

  return json({ ok: true, id: row.id, status: "pending" }, 201);
}
