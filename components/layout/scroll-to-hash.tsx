"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

const MAX_FRAMES = 300;
const RETRY_DELAYS = [120, 400, 900, 1600, 2600];

function scrollToHashId(id: string) {
  const el =
    document.getElementById(id) ??
    document.getElementById(decodeURIComponent(id));
  if (!el) return false;
  el.scrollIntoView({ block: "start", behavior: "instant" as ScrollBehavior });
  return true;
}

export function ScrollToHash() {
  const pathname = usePathname();

  React.useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    let raf = 0;
    let frames = 0;
    let settled = false;

    const attempt = () => {
      if (settled) return;
      if (scrollToHashId(id)) settled = true;
    };

    const tick = () => {
      attempt();
      if (!settled && frames++ < MAX_FRAMES) raf = requestAnimationFrame(tick);
    };
    tick();

    const timers = RETRY_DELAYS.map((delay) => window.setTimeout(attempt, delay));

    return () => {
      cancelAnimationFrame(raf);
      for (const t of timers) window.clearTimeout(t);
    };
  }, [pathname]);

  React.useEffect(() => {
    const onHash = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      scrollToHashId(id);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return null;
}
