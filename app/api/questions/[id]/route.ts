import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  json,
  errorResponse,
  requireAdmin,
} from "@/lib/api-helpers";
import { mapQuestion } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return errorResponse("غير مصرّح", 403);

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  if (typeof body.isRead !== "boolean")
    return errorResponse("بيانات غير صالحة.");

  try {
    const row = await prisma.question.update({
      where: { id },
      data: { isRead: body.isRead },
    });
    return json(mapQuestion(row));
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    )
      return errorResponse("السؤال غير موجود.", 404);
    throw err;
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return errorResponse("غير مصرّح", 403);

  const { id } = await params;
  try {
    await prisma.question.delete({ where: { id } });
    return json({ ok: true });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    )
      return errorResponse("السؤال غير موجود.", 404);
    throw err;
  }
}
