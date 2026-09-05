"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const mainLinks = [
  { label: "المنهج – أربع قواعد", href: "/method" },
  { label: "فكرة المشروع وأسبابه", href: "/about-project" },
  { label: "كيف تقرأ هذا الكتاب", href: "/how-to-read" },
] as const;

const secondaryLinks = [
  { label: "عن المؤلّف", href: "/author" },
  { label: "حدود هذا المشروع", href: "/limits" },
  { label: "التحميل والاستشهاد", href: "/cite" },
] as const;

export function AboutProjectDropdown() {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex items-center gap-1 rounded-lg px-3 py-2 font-kufi text-sm font-medium transition-colors",
          open
            ? "bg-paper-deep text-ink"
            : "text-ink-soft hover:bg-paper-deep hover:text-ink",
        )}
      >
        عن المشروع
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      <div
        role="menu"
        className={cn(
          "absolute start-0 top-full z-50 mt-2 w-[min(520px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-line bg-card shadow-lift",
          "transition-all duration-200",
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-1 opacity-0",
        )}
      >
        <div className="p-5">
          <span className="mb-4 block font-kufi text-xs font-semibold tracking-wide text-ink-faint">
            عن المشروع
          </span>

          <div className="flex flex-col gap-x-8 sm:flex-row">
            <nav className="flex flex-1 flex-col gap-0.5">
              {mainLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  className="rounded-lg px-3 py-2.5 font-kufi text-sm font-medium text-ink transition-colors hover:bg-paper-deep"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="my-2 hidden w-px bg-line sm:block" />
            <div className="my-2 block h-px bg-line sm:hidden" />

            <nav className="flex flex-1 flex-col gap-0.5">
              {secondaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  role="menuitem"
                  className="rounded-lg px-3 py-2.5 font-kufi text-sm font-medium text-ink transition-colors hover:bg-paper-deep"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
