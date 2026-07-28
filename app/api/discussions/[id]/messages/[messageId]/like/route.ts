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
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });
  if (!message || message.discussionId !== id)
    return errorResponse("التعليق غير موجود", 404);

  const likes = message.likes as string[];
  const idx = likes.indexOf(user.id);
  const updated =
    idx === -1
      ? [...likes, user.id]
      : likes.filter((uid) => uid !== user.id);

  await prisma.message.update({
    where: { id: messageId },
    data: { likes: updated },
  });
  return json({ ok: true });
}
