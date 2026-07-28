"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "default",
  hint,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "default" | "amber" | "emerald" | "sky";
  hint?: string;
}) {
  const toneClass = {
    default: "bg-accent-soft text-accent",
    amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    sky: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  }[tone];

  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            toneClass,
          )}
        >
          <Icon className="h-4.5 w-4.5" />
        </span>
      </div>
      <p className="mt-3 font-amiri text-3xl font-bold text-ink">{value}</p>
      <p className="mt-0.5 font-kufi text-sm text-ink-soft">{label}</p>
      {hint && (
        <p className="mt-1 truncate font-kufi text-xs text-ink-faint">{hint}</p>
      )}
    </div>
  );
}
