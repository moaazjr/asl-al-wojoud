import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/server-auth";
import { json, errorResponse } from "@/lib/api-helpers";
import { mapUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { name, email, password } = body as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || name.trim().length < 2)
    return errorResponse("الاسم مطلوب");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return errorResponse("بريد إلكتروني غير صالح");
  if (!password || password.length < 6)
    return errorResponse("كلمة المرور يجب أن تكون ٦ أحرف على الأقل");

  const normalized = email.toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: normalized },
  });
  if (existing)
    return errorResponse("البريد الإلكتروني مُستخدم بالفعل");

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalized,
      passwordHash: hashPassword(password),
      role: "USER",
    },
  });

  await createSession(user.id);
  return json({ user: mapUser(user) });
}
