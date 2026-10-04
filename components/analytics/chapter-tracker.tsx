"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/gtag";

export function ChapterTracker() {
  const pathname = usePathname();
  const trackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    const isChapterPage = /^\/\d+\/[^/]+$/.test(pathname);
    if (!isChapterPage) {
      trackedPathRef.current = null;
      return;
    }

    if (trackedPathRef.current === pathname) {
      return;
    }

    trackedPathRef.current = pathname;
    trackEvent("chapter_open");
  }, [pathname]);

  return null;
}
