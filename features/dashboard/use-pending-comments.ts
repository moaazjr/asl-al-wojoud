"use client";

import * as React from "react";
import type { PublicCommentCounts } from "@/interfaces/types";
import { listPublicComments } from "@/features/comments/api";

const CHANGED_EVENT = "public-comments:changed";
const POLL_MS = 60_000;

export function notifyPublicCommentsChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGED_EVENT));
  }
}

export function usePublicCommentCounts(enabled = true) {
  const [counts, setCounts] = React.useState<PublicCommentCounts | null>(null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const load = () => {
      listPublicComments({ status: "pending", pageSize: 1 })
        .then((res) => {
          if (cancelled) return;
          setCounts(res.counts);
          setError(false);
        })
        .catch(() => {
          if (!cancelled) setError(true);
        });
    };

    load();
    const timer = window.setInterval(load, POLL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    window.addEventListener(CHANGED_EVENT, load);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener(CHANGED_EVENT, load);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled]);

  return { counts, error };
}
