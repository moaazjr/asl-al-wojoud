import { prisma } from "@/lib/prisma";
import {
  json,
  errorResponse,
  requireUser,
} from "@/lib/api-helpers";
import { mapNotification } from "@/lib/db";

export async function GET() {
  const user = await requireUser();
  if (!user) return errorResponse("غير مصرّح", 401);

  const rows = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return json(rows.map(mapNotification));
}

export async function DELETE() {
  const user = await requireUser();
  if (!user) return errorResponse("غير مصرّح", 401);

  await prisma.notification.deleteMany({
    where: { userId: user.id },
  });
  return json({ ok: true });
}
