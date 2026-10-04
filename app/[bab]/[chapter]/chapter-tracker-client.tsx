"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/gtag";

export function ChapterTrackerClient() {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackEvent("chapter_open");
  }, []);

  return null;
}
