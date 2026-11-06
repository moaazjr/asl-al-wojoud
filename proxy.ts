import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const CANONICAL_ORIGIN = (
  process.env.CANONICAL_ORIGIN?.trim() || "https://asl-al-wojoud.io"
).replace(/\/+$/, "");

const CANONICAL_HOST = new URL(CANONICAL_ORIGIN).host;

function isDuplicateHost(host: string): boolean {
  const h = host.toLowerCase().split(":")[0];
  if (h === CANONICAL_HOST) return false;
  return h.endsWith(".vercel.app") || h === `www.${CANONICAL_HOST}`;
}

export function proxy(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  if (!isDuplicateHost(host)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/api/")) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }
  return NextResponse.redirect(`${CANONICAL_ORIGIN}${pathname}${search}`, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
