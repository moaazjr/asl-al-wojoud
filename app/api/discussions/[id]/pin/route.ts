import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  json,
  errorResponse,
  requireAdmin,
} from "@/lib/api-helpers";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return errorResponse("غير مصرّح", 403);

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const messageId = String(body.messageId ?? "");
  if (!messageId) return errorResponse("معرّف التعليق مطلوب");

  const [discussion, message] = await Promise.all([
    prisma.discussion.findUnique({
      where: { id },
      select: { id: true },
    }),
    prisma.message.findUnique({
      where: { id: messageId },
      select: { discussionId: true },
    }),
  ]);
  if (!discussion) return errorResponse("التعليق غير موجود", 404);
  if (!message || message.discussionId !== id) {
    return errorResponse("التعليق غير موجود", 404);
  }

  await prisma.discussion.update({
    where: { id },
    data: { pinnedMessageId: messageId },
  });
  return json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return errorResponse("غير مصرّح", 403);

  const { id } = await params;
  await prisma.discussion.updateMany({
    where: { id },
    data: { pinnedMessageId: null },
  });
  return json({ ok: true });
}
