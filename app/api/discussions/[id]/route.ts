import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  json,
  errorResponse,
  requireUser,
} from "@/lib/api-helpers";
import { mapDiscussion } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const row = await prisma.discussion.findUnique({
    where: { id },
    include: { messages: true },
  });
  if (!row) return json(null);
  return json(mapDiscussion(row));
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const user = await requireUser();
  if (!user) return errorResponse("غير مصرّح", 401);

  const { id } = await params;
  const url = new URL(req.url);
  const mode = url.searchParams.get("mode");

  const discussion = await prisma.discussion.findUnique({
    where: { id },
  });
  if (!discussion) return json({ ok: true });

  if (mode === "highlight") {
    if (
      discussion.kind !== "HIGHLIGHT" ||
      discussion.createdById !== user.id
    ) {
      return errorResponse("غير مصرّح", 403);
    }
  } else {
    if (user.role !== "admin" && discussion.createdById !== user.id) {
      return errorResponse("غير مصرّح بحذف هذا النقاش", 403);
    }
  }

  await prisma.discussion.delete({ where: { id } });
  return json({ ok: true });
}
