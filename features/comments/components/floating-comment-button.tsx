"use client";

import * as React from "react";
import { MessageCircle } from "lucide-react";
import { useSettings } from "@/features/settings/settings-context";
import { trackEvent } from "@/lib/gtag";
import { cn } from "@/lib/utils";

export function FloatingCommentButton({ sectionId }: { sectionId: string }) {
  const { settings } = useSettings();
  const [atComments, setAtComments] = React.useState(false);

  React.useEffect(() => {
    const target = document.getElementById("section-comments");
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setAtComments(entry.isIntersecting),
      { rootMargin: "0px 0px -20% 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (!settings.commentsEnabled || settings.lockedSections.includes(sectionId)) {
    return null;
  }

  function goToComments() {
    const section = document.getElementById("section-comments");
    if (!section) return;
    trackEvent("comment_button_click", { section_id: sectionId, source: "floating_button" });
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      section.querySelector<HTMLTextAreaElement>("textarea")?.focus({ preventScroll: true });
    }, 600);
  }

  return (
    <button
      type="button"
      onClick={goToComments}
      aria-label="انتقل إلى التعليقات وشاركنا رأيك"
      className={cn(
        "fixed bottom-6 right-6 z-30 flex h-11 items-center gap-2 rounded-full bg-accent px-4 font-kufi text-sm font-semibold text-paper shadow-lift transition-all hover:bg-accent-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
        atComments ? "pointer-events-none translate-y-4 opacity-0" : "opacity-100",
      )}
    >
      <MessageCircle className="h-4.5 w-4.5" />
      شاركنا رأيك
    </button>
  );
}
