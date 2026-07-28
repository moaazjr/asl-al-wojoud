import { prisma } from "@/lib/prisma";
import {
  json,
  errorResponse,
  requireAdmin,
} from "@/lib/api-helpers";
import { mapUser } from "@/lib/db";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return errorResponse("غير مصرّح", 403);

  const rows = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });
  return json(rows.map(mapUser));
}
