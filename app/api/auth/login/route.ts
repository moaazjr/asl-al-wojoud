import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSession } from "@/lib/server-auth";
import { json, errorResponse } from "@/lib/api-helpers";
import { mapUser } from "@/lib/db";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const MAX_EMAIL = 160;
const MAX_PASSWORD = 200;
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 15 * 60 * 1000;

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limited = rateLimit(`auth:login:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.ok)
    return errorResponse(
      "محاولات دخول كثيرة. يرجى المحاولة لاحقًا.",
      429,
    );

  const body = await req.json().catch(() => ({}));
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password)
    return errorResponse("البريد الإلكتروني وكلمة المرور مطلوبان.", 400);
  if (email.length > MAX_EMAIL || password.length > MAX_PASSWORD)
    return errorResponse("بيانات الدخول غير صحيحة", 401);

  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user || !verifyPassword(password, user.passwordHash))
    return errorResponse("بيانات الدخول غير صحيحة", 401);

  await createSession(user.id);
  return json({ user: mapUser(user) });
}
