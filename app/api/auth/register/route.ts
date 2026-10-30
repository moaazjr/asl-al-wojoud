import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSession } from "@/lib/server-auth";
import { json, errorResponse } from "@/lib/api-helpers";
import { mapUser } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const MAX_NAME = 80;
const MAX_EMAIL = 160;
const MAX_PASSWORD = 200;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limited = rateLimit(`auth:register:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.ok)
    return errorResponse(
      "محاولات تسجيل كثيرة. يرجى المحاولة لاحقًا.",
      429,
    );

  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const normalized =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (name.length < 2) return errorResponse("الاسم مطلوب");
  if (name.length > MAX_NAME) return errorResponse("الاسم طويل جدًا");
  if (normalized.length > MAX_EMAIL)
    return errorResponse("بريد إلكتروني غير صالح");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))
    return errorResponse("بريد إلكتروني غير صالح");
  if (password.length < 6)
    return errorResponse("كلمة المرور يجب أن تكون ٦ أحرف على الأقل");
  if (password.length > MAX_PASSWORD)
    return errorResponse("كلمة المرور طويلة جدًا");

  const existing = await prisma.user.findUnique({
    where: { email: normalized },
  });
  if (existing)
    return errorResponse("البريد الإلكتروني مُستخدم بالفعل");

  let user;
  try {
    user = await prisma.user.create({
      data: {
        name,
        email: normalized,
        passwordHash: hashPassword(password),
        role: "USER",
      },
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    )
      return errorResponse("البريد الإلكتروني مُستخدم بالفعل");
    throw err;
  }

  await createSession(user.id);
  return json({ user: mapUser(user) });
}
