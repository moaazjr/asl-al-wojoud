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

export async function POST(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return errorResponse("غير مصرّح", 403);

  const { id } = await params;
  const discussion = await prisma.discussion.findUnique({
    where: { id },
  });
  if (!discussion) return json({ ok: true });

  await prisma.discussion.update({
    where: { id },
    data: {
      status: "RESOLVED",
      resolvedAt: new Date(),
      resolvedById: admin.id,
    },
  });

  if (discussion.createdById !== admin.id) {
    await prisma.notification.create({
      data: {
        userId: discussion.createdById,
        type: "discussion-resolved",
        discussionId: discussion.id,
        sectionId: discussion.sectionId,
        sectionTitle: discussion.sectionTitle,
        text: `تمّ إغلاق نقاشك: «${discussion.selectedText.slice(0, 60)}»`,
      },
    });
  }

  return json({ ok: true });
}
