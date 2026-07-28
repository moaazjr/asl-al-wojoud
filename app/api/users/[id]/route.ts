import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  json,
  errorResponse,
  requireUser,
} from "@/lib/api-helpers";
import { mapUser } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const user = await requireUser();
  if (!user) return errorResponse("غير مصرّح", 401);

  const { id } = await params;
  const row = await prisma.user.findUnique({ where: { id } });
  if (!row) return json(null);

  if (user.id !== id && user.role !== "admin")
    return errorResponse("غير مصرّح", 403);

  return json(mapUser(row));
}
