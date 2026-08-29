"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export function ScrollToHash() {
  const pathname = usePathname();

  React.useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;

    let raf = 0;
    let count = 0;
    let done = false;

    const doScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ block: "start" });
        done = true;
      }
    };

    const tick = () => {
      if (done) return;
      doScroll();
      if (!done && count++ < 200) raf = requestAnimationFrame(tick);
    };
    tick();

    const late1 = window.setTimeout(doScroll, 700);
    const late2 = window.setTimeout(doScroll, 2000);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(late1);
      window.clearTimeout(late2);
    };
  }, [pathname]);

  React.useEffect(() => {
    const onHash = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ block: "start" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return null;
}
