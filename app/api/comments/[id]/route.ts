import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { json, errorResponse, requireAdmin } from "@/lib/api-helpers";
import { mapPublicComment } from "@/lib/db";
import { sanitizeText } from "@/lib/sanitize";

type Params = { params: Promise<{ id: string }> };

const MAX_REPLY = 2000;

const STATUS_BY_ACTION = {
  approve: "APPROVED",
  reject: "REJECTED",
  pending: "PENDING",
} as const;

type StatusAction = keyof typeof STATUS_BY_ACTION;

function isStatusAction(value: string): value is StatusAction {
  return value in STATUS_BY_ACTION;
}

function notFound(err: unknown) {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025"
  );
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return errorResponse("غير مصرّح", 403);

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const action = String(body?.action ?? "");

  let data: Prisma.PublicCommentUpdateInput;

  if (isStatusAction(action)) {
    data = {
      status: STATUS_BY_ACTION[action],
      moderatedAt: new Date(),
      moderatedById: admin.id,
    };
  } else if (action === "reply") {
    const reply = sanitizeText(String(body?.reply ?? ""));
    if (!reply) return errorResponse("يرجى كتابة الردّ.");
    if (reply.length > MAX_REPLY)
      return errorResponse(`الردّ طويل جدًا (الحد ${MAX_REPLY} حرف).`);
    data = {
      adminReply: reply,
      adminReplyAt: new Date(),
      adminReplyById: admin.id,
    };
  } else if (action === "remove-reply") {
    data = { adminReply: null, adminReplyAt: null, adminReplyById: null };
  } else {
    return errorResponse("إجراء غير صالح.");
  }

  try {
    const row = await prisma.publicComment.update({ where: { id }, data });
    return json(mapPublicComment(row));
  } catch (err) {
    if (notFound(err)) return errorResponse("التعليق غير موجود.", 404);
    console.error("[comments] moderation failed", err);
    return errorResponse("تعذّر تحديث التعليق.", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return errorResponse("غير مصرّح", 403);

  const { id } = await params;
  try {
    await prisma.publicComment.delete({ where: { id } });
    return json({ ok: true });
  } catch (err) {
    if (notFound(err)) return errorResponse("التعليق غير موجود.", 404);
    console.error("[comments] delete failed", err);
    return errorResponse("تعذّر حذف التعليق.", 500);
  }
}
