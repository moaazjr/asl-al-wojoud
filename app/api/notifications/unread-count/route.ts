import { prisma } from "@/lib/prisma";
import {
  json,
  errorResponse,
  requireUser,
} from "@/lib/api-helpers";

export async function GET() {
  const user = await requireUser();
  if (!user) return errorResponse("غير مصرّح", 401);

  const count = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });
  return json({ count });
}
