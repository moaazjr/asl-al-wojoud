import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  json,
  errorResponse,
  requireAdmin,
} from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return errorResponse("غير مصرّح", 403);

  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "");
  const ids: string[] = Array.isArray(body.ids) ? body.ids : [];

  if (action !== "resolve" && action !== "delete") {
    return errorResponse("إجراء غير معروف.", 400);
  }
  if (ids.length === 0) return json({ ok: true });

  if (action === "resolve") {
    const open = await prisma.discussion.findMany({
      where: { id: { in: ids }, status: "OPEN" },
      select: {
        id: true,
        createdById: true,
        sectionId: true,
        sectionTitle: true,
      },
    });
    if (open.length > 0) {
      await prisma.discussion.updateMany({
        where: { id: { in: open.map((d) => d.id) } },
        data: {
          status: "RESOLVED",
          resolvedAt: new Date(),
          resolvedById: admin.id,
        },
      });
      const notifications = open
        .filter((d) => d.createdById !== admin.id)
        .map((d) => ({
          userId: d.createdById,
          type: "discussion-resolved",
          discussionId: d.id,
          sectionId: d.sectionId,
          sectionTitle: d.sectionTitle,
          text: `تمّ إغلاق تعليقك في «${d.sectionTitle}»`,
        }));
      if (notifications.length > 0) {
        await prisma.notification.createMany({ data: notifications });
      }
    }
  } else {
    await prisma.notification.deleteMany({
      where: { discussionId: { in: ids } },
    });
    await prisma.discussion.deleteMany({
      where: { id: { in: ids } },
    });
  }

  return json({ ok: true });
}
