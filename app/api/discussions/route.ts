import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { roleToEnum } from "@/lib/server-auth";
import {
  json,
  errorResponse,
  requireUser,
  requireAdmin,
} from "@/lib/api-helpers";
import { mapDiscussion, sortDiscussionsByLastMessage } from "@/lib/db";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const sectionId = url.searchParams.get("sectionId");
  const mine = url.searchParams.get("mine");
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  if (mine) {
    const user = await requireUser();
    if (!user) return errorResponse("غير مصرّح", 401);
    const rows = await prisma.discussion.findMany({
      where: { kind: "DISCUSSION", createdById: user.id },
      include: { messages: true },
    });
    return json(sortDiscussionsByLastMessage(rows.map(mapDiscussion)));
  }

  if (sectionId) {
    const rows = await prisma.discussion.findMany({
      where: { kind: "DISCUSSION", sectionId },
      include: { messages: true },
    });
    return json(sortDiscussionsByLastMessage(rows.map(mapDiscussion)));
  }

  const admin = await requireAdmin();
  if (!admin) return errorResponse("غير مصرّح", 403);

  const where: Prisma.DiscussionWhereInput = { kind: "DISCUSSION" };
  if (status) where.status = status.toUpperCase() as "OPEN" | "RESOLVED";
  if (search) {
    where.OR = [
      { sectionTitle: { contains: search, mode: "insensitive" } },
      {
        messages: {
          some: { text: { contains: search, mode: "insensitive" } },
        },
      },
    ];
  }

  const rows = await prisma.discussion.findMany({
    where,
    include: { messages: true },
  });
  return json(sortDiscussionsByLastMessage(rows.map(mapDiscussion)));
}

export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (!user) return errorResponse("غير مصرّح", 401);

  const body = await req.json().catch(() => ({}));

  const sectionId = String(body.sectionId ?? "");
  const sectionTitle = String(body.sectionTitle ?? "");
  const bookTitle = String(body.bookTitle ?? "");

  if (!sectionId) return errorResponse("معرّف القسم مطلوب");

  const text = String(body.text ?? "").trim();
  if (!text) return errorResponse("النص مطلوب");
  if (text.length > 1000)
    return errorResponse("النص طويل جدًا (الحد ١٠٠٠ حرف)");

  const row = await prisma.discussion.create({
    data: {
      kind: "DISCUSSION",
      sectionId,
      sectionTitle,
      bookTitle,
      blockIndex: 0,
      selectedText: "",
      charStart: 0,
      charEnd: 0,
      createdById: user.id,
      messages: {
        create: {
          authorId: user.id,
          authorName: user.name,
          authorRole: roleToEnum(user.role),
          text,
        },
      },
    },
    include: { messages: true },
  });
  return json(mapDiscussion(row));
}
