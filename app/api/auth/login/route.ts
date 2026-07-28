import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/server-auth";
import { json, errorResponse } from "@/lib/api-helpers";
import { mapUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, password } = body as {
    email?: string;
    password?: string;
  };

  if (!email || !password)
    return errorResponse("بيانات الدخول غير صحيحة", 401);

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
  if (!user || !verifyPassword(password, user.passwordHash))
    return errorResponse("بيانات الدخول غير صحيحة", 401);

  await createSession(user.id);
  return json({ user: mapUser(user) });
}
