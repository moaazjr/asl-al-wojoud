import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { json, errorResponse, requireAdmin } from "@/lib/api-helpers";
import { mapApprovedPublicComment, mapPublicComment } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { sanitizeText, isLikelyEmail } from "@/lib/sanitize";
import { sendPendingCommentNotification } from "@/lib/email";
import { getSiteSettings } from "@/lib/settings";
import type { PublicCommentCounts } from "@/interfaces/types";

export const dynamic = "force-dynamic";

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
const MAX_LINKS = 2;
const MAX_SECTION_ID = 200;
const MAX_TITLE = 300;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const DUPLICATE_WINDOW_MS = 10 * 60 * 1000;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MAX_PUBLIC_RESULTS = 200;
const SECTION_ID_PATTERN = /^[\w؀-ۿ%.\-/]+$/;
const LINK_PATTERN = /(https?:\/\/|www\.)/gi;

const NO_STORE = { "Cache-Control": "no-store" };

function toInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function loadCounts(
  base: Prisma.PublicCommentWhereInput,
): Promise<PublicCommentCounts> {
  const grouped = await prisma.publicComment.groupBy({
    by: ["status"],
    where: base,
    _count: { _all: true },
  });
  const counts: PublicCommentCounts = {
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
  };
  for (const row of grouped) {
    const n = row._count._all;
    if (row.status === "PENDING") counts.pending = n;
    if (row.status === "APPROVED") counts.approved = n;
    if (row.status === "REJECTED") counts.rejected = n;
    counts.total += n;
  }
  return counts;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sectionId = url.searchParams.get("sectionId");
  const status = url.searchParams.get("status");

  if (sectionId && !status) {
    const rows = await prisma.publicComment.findMany({
      where: { sectionId, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: MAX_PUBLIC_RESULTS,
    });
    return json(rows.map(mapApprovedPublicComment));
  }

  const admin = await requireAdmin();
  if (!admin) return errorResponse("غير مصرّح", 403);

  const base: Prisma.PublicCommentWhereInput = {};
  if (sectionId) base.sectionId = sectionId;

  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  if (q) {
    base.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { text: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { sectionTitle: { contains: q, mode: "insensitive" } },
      { bookTitle: { contains: q, mode: "insensitive" } },
      { sectionId: { contains: q } },
    ];
  }

  const where: Prisma.PublicCommentWhereInput = { ...base };
  if (status && status.toLowerCase() !== "all") {
    const normalized = status.toUpperCase() as ModerationStatus;
    if (!MODERATION_STATUSES.includes(normalized)) {
      return errorResponse("حالة التعليق غير صالحة.", 400);
    }
    where.status = normalized;
  }

  const page = toInt(url.searchParams.get("page"), 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    toInt(url.searchParams.get("pageSize"), DEFAULT_PAGE_SIZE),
  );

  const [rows, total, counts] = await Promise.all([
    prisma.publicComment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.publicComment.count({ where }),
    loadCounts(base),
  ]);

  return Response.json(
    {
      items: rows.map(mapPublicComment),
      total,
      page,
      pageSize,
      counts,
    },
    { headers: NO_STORE },
  );
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

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return errorResponse("طلب غير صالح.");
  }

  if (typeof body.hp_field === "string" && body.hp_field.trim() !== "") {
    console.warn("[comments] honeypot triggered; submission discarded", { ip });
    return json({ ok: true, status: "pending" }, 201);
  }

  const sectionId = sanitizeText(String(body.sectionId ?? ""));
  const sectionTitle = sanitizeText(String(body.sectionTitle ?? "")).slice(0, MAX_TITLE);
  const bookTitle = sanitizeText(String(body.bookTitle ?? "")).slice(0, MAX_TITLE);
  const name = sanitizeText(String(body.name ?? "")).replace(/\s+/g, " ");
  const email = sanitizeText(String(body.email ?? ""));
  const text = sanitizeText(String(body.text ?? ""));

  if (!sectionId) return errorResponse("معرّف المبحث مطلوب.");
  if (sectionId.length > MAX_SECTION_ID || !SECTION_ID_PATTERN.test(sectionId))
    return errorResponse("معرّف المبحث غير صالح.");
  if (!name) return errorResponse("يرجى إدخال الاسم.");
  if (name.length > MAX_NAME) return errorResponse("الاسم طويل جدًا.");
  if (!text) return errorResponse("يرجى كتابة التعليق.");
  if (text.length < MIN_TEXT) return errorResponse("التعليق قصير جدًا.");
  if (text.length > MAX_TEXT)
    return errorResponse(`التعليق طويل جدًا (الحد ${MAX_TEXT} حرف).`);
  if ((text.match(LINK_PATTERN)?.length ?? 0) > MAX_LINKS)
    return errorResponse("يحتوي التعليق على روابط كثيرة.");
  if (email && email.length > MAX_EMAIL)
    return errorResponse("البريد الإلكتروني طويل جدًا.");
  if (email && !isLikelyEmail(email))
    return errorResponse("البريد الإلكتروني غير صالح.");

  const settings = await getSiteSettings();
  if (!settings.commentsEnabled)
    return errorResponse("التعليقات معطّلة حاليًا.", 403);
  if (settings.lockedSections.includes(sectionId))
    return errorResponse("هذا المبحث مقفل ولا يمكن إضافة تعليقات عليه.", 403);

  let row;
  try {
    const duplicate = await prisma.publicComment.findFirst({
      where: {
        sectionId,
        name,
        text,
        createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
      },
      select: { id: true },
    });
    if (duplicate) {
      return json({ ok: true, id: duplicate.id, status: "pending" }, 201);
    }

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
