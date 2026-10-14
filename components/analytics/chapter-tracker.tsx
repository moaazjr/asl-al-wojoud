"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/gtag";

export function ChapterTracker() {
  const pathname = usePathname();
  const trackedPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    const match = /^\/(\d+)\/([^/]+)$/.exec(pathname);
    if (!match) {
      trackedPathRef.current = null;
      return;
    }

    if (trackedPathRef.current === pathname) {
      return;
    }
    trackedPathRef.current = pathname;

    const meta = document.querySelector<HTMLElement>("[data-chapter-id]");
    const chapterId = meta?.dataset.chapterId ?? `${match[1]}/${match[2]}`;
    const chapterTitle =
      meta?.dataset.chapterTitle ?? document.title.split(" — ")[0];

    trackEvent("chapter_open", {
      chapter_id: chapterId,
      chapter_title: chapterTitle,
      page_location: window.location.href,
    });
  }, [pathname]);

  return null;
}
