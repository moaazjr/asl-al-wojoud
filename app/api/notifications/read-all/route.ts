import { prisma } from "@/lib/prisma";
import {
  json,
  errorResponse,
  requireUser,
} from "@/lib/api-helpers";

export async function POST() {
  const user = await requireUser();
  if (!user) return errorResponse("غير مصرّح", 401);

  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  return json({ ok: true });
}
