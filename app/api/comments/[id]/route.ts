import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { json, errorResponse, requireAdmin } from "@/lib/api-helpers";
import { mapPublicComment } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return errorResponse("غير مصرّح", 403);

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const action = String(body.action ?? "");

  if (action !== "approve" && action !== "reject") {
    return errorResponse("إجراء غير صالح.");
  }

  const status = action === "approve" ? "APPROVED" : "REJECTED";

  try {
    const row = await prisma.publicComment.update({
      where: { id },
      data: {
        status,
        moderatedAt: new Date(),
        moderatedById: admin.id,
      },
    });
    return json(mapPublicComment(row));
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return errorResponse("التعليق غير موجود.", 404);
    }
    throw err;
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const admin = await requireAdmin();
  if (!admin) return errorResponse("غير مصرّح", 403);

  const { id } = await params;
  try {
    await prisma.publicComment.delete({ where: { id } });
    return json({ ok: true });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return errorResponse("التعليق غير موجود.", 404);
    }
    throw err;
  }
}
