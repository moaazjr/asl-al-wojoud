import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  json,
  errorResponse,
  requireUser,
} from "@/lib/api-helpers";

interface Params {
  params: Promise<{ id: string; messageId: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const user = await requireUser();
  if (!user) return errorResponse("غير مصرّح", 401);

  const { id, messageId } = await params;
  const body = await req.json().catch(() => ({}));
  const text = String(body.text ?? "").trim();
  if (!text) return errorResponse("النص مطلوب");

  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });
  if (!message || message.discussionId !== id)
    return errorResponse("التعليق غير موجود", 404);

  const canEdit =
    (user.role === "admin" && message.authorRole === "ADMIN") ||
    message.authorId === user.id;
  if (!canEdit) return errorResponse("غير مصرّح", 403);

  await prisma.message.update({
    where: { id: messageId },
    data: { text, editedAt: new Date() },
  });
  return json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const user = await requireUser();
  if (!user) return errorResponse("غير مصرّح", 401);

  const { id, messageId } = await params;
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });
  if (!message || message.discussionId !== id) return json({ ok: true });

  const allowed =
    user.role === "admin" || message.authorId === user.id;
  if (!allowed) return errorResponse("غير مصرّح بحذف هذا التعليق", 403);

  const count = await prisma.message.count({
    where: { discussionId: id },
  });

  if (count <= 1) {
    await prisma.discussion.delete({ where: { id } });
  } else {
    await prisma.message.delete({ where: { id: messageId } });
    const discussion = await prisma.discussion.findUnique({
      where: { id },
    });
    if (discussion?.pinnedMessageId === messageId) {
      await prisma.discussion.update({
        where: { id },
        data: { pinnedMessageId: null },
      });
    }
  }

  return json({ ok: true });
}
