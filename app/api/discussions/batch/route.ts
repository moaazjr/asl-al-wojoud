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
  if (ids.length === 0) return json({ ok: true });

  if (action === "resolve") {
    await prisma.discussion.updateMany({
      where: { id: { in: ids } },
      data: {
        status: "RESOLVED",
        resolvedAt: new Date(),
        resolvedById: admin.id,
      },
    });
  } else if (action === "delete") {
    await prisma.discussion.deleteMany({
      where: { id: { in: ids } },
    });
  }

  return json({ ok: true });
}
