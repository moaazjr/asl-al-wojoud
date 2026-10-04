"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/gtag";

export function ChapterListTracker() {
  const pathname = usePathname();
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    const isBookList = /^\/\d+$/.test(pathname);
    if (!isBookList) {
      trackedRef.current = null;
      return;
    }
    if (trackedRef.current === pathname) return;
    trackedRef.current = pathname;
    trackEvent("chapter_open");
  }, [pathname]);

  return null;
}
