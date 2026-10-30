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

export async function POST(_req: NextRequest, { params }: Params) {
  const user = await requireUser();
  if (!user) return errorResponse("غير مصرّح", 401);

  const { id, messageId } = await params;

  const found = await prisma.$transaction(async (tx) => {
    const rows = await tx.$queryRaw<
      { likes: string[]; discussionId: string }[]
    >`SELECT "likes", "discussionId" FROM "Message" WHERE "id" = ${messageId} FOR UPDATE`;
    const message = rows[0];
    if (!message || message.discussionId !== id) return false;

    const likes = message.likes;
    const updated = likes.includes(user.id)
      ? likes.filter((uid) => uid !== user.id)
      : [...likes, user.id];

    await tx.message.update({
      where: { id: messageId },
      data: { likes: updated },
    });
    return true;
  });

  if (!found) return errorResponse("التعليق غير موجود", 404);
  return json({ ok: true });
}
