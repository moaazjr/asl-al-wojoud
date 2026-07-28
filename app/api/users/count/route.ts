import { prisma } from "@/lib/prisma";
import {
  json,
  errorResponse,
  requireAdmin,
} from "@/lib/api-helpers";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return errorResponse("غير مصرّح", 403);

  const count = await prisma.user.count();
  return json({ count });
}
