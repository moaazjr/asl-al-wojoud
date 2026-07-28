import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { roleToEnum } from "@/lib/server-auth";
import {
  json,
  errorResponse,
  requireUser,
} from "@/lib/api-helpers";
import { mapMessage } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  const user = await requireUser();
  if (!user) return errorResponse("غير مصرّح", 401);

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const text = String(body.text ?? "").trim();
  if (!text) return errorResponse("النص مطلوب");
  if (text.length > 1000)
    return errorResponse("النص طويل جدًا");

  const discussion = await prisma.discussion.findUnique({
    where: { id },
  });
  if (!discussion) return errorResponse("النقاش غير موجود", 404);

  const isAdmin = user.role === "admin";
  if (!isAdmin) {
    return errorResponse("يمكن للمشرف فقط الردّ على التعليقات", 403);
  }

  const parentMessageId = body.parentMessageId
    ? String(body.parentMessageId)
    : null;

  const message = await prisma.message.create({
    data: {
      discussionId: id,
      authorId: user.id,
      authorName: user.name,
      authorRole: roleToEnum(user.role),
      text,
      parentMessageId,
    },
  });

  if (isAdmin) {
    await prisma.discussion.update({
      where: { id },
      data: { hasAdminReply: true },
    });
  }

  if (isAdmin && discussion.createdById !== user.id) {
    await prisma.notification.create({
      data: {
        userId: discussion.createdById,
        type: "admin-reply",
        discussionId: discussion.id,
        sectionId: discussion.sectionId,
        sectionTitle: discussion.sectionTitle,
        text: `ردّ المشرف على نقاشك: «${discussion.selectedText.slice(0, 60)}»`,
      },
    });
  }

  return json(mapMessage(message));
}
