import "server-only";
import { NextResponse } from "next/server";
import type { User } from "@/interfaces/types";
import { getCurrentUser } from "@/lib/server-auth";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export { getCurrentUser };

export async function requireUser(): Promise<User | null> {
  return getCurrentUser();
}

export async function requireAdmin(): Promise<User | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
