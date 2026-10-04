"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/gtag";

export function ChapterTracker() {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackEvent("chapter_open");
  }, []);

  return null;
}
