"use client";

import * as React from "react";

export function ReadingProgress() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let frame = 0;
    const update = () => {
      const el = document.documentElement;
      const scrollTop = el.scrollTop;
      const height = el.scrollHeight - el.clientHeight;
      setProgress(height > 0 ? Math.min(100, (scrollTop / height) * 100) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-0.5 bg-transparent"
      role="progressbar"
      aria-label="تقدّم القراءة"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-gradient-to-l from-accent-bright to-accent transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
