import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { mapUser } from "@/lib/db";
import type { Role, User } from "@/interfaces/types";

export const SESSION_COOKIE = "aa_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const hashBuf = Buffer.from(scryptSync(password, salt, 64));
  const keyBuf = Buffer.from(key, "hex");
  return (
    hashBuf.length === keyBuf.length && timingSafeEqual(hashBuf, keyBuf)
  );
}

export async function getCurrentUser(): Promise<User | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return mapUser(session.user);
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomUUID();
  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
  return token;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
  }
  store.delete(SESSION_COOKIE);
}

export function roleToEnum(role: Role): "USER" | "ADMIN" {
  return role === "admin" ? "ADMIN" : "USER";
}
