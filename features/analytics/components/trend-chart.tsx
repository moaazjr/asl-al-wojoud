"use client";

import { cn } from "@/lib/utils";
import type { AnalyticsBreakdownRow } from "@/interfaces/analytics";

const TONE_CLASS = {
  default: "text-accent",
  sky: "text-sky-600 dark:text-sky-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
} as const;

type Tone = keyof typeof TONE_CLASS;

export function TrendChart({
  title,
  data,
  tone = "default",
  formatValue = (n) => n.toLocaleString("en-US"),
}: {
  title: string;
  data: { date: string; value: number }[];
  tone?: Tone;
  formatValue?: (value: number) => string;
}) {
  const values = data.map((point) => point.value);
  const total = values.reduce((sum, value) => sum + value, 0);
  const max = Math.max(1, ...values);
  const hasData = values.length > 1 && total > 0;

  const W = 100;
  const H = 40;
  const step = values.length > 1 ? W / (values.length - 1) : W;
  const points = values.map((value, index) => {
    const x = index * step;
    const y = H - (value / max) * (H - 4) - 2;
    return [x, y] as const;
  });
  const line = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
  const area = points.length ? `${line} L${W},${H} L0,${H} Z` : "";

  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-soft">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-kufi text-sm font-semibold text-ink">{title}</h3>
        <span className="font-amiri text-xl font-bold text-ink">
          {formatValue(total)}
        </span>
      </div>
      <div className={cn("mt-3 h-24 w-full", TONE_CLASS[tone])}>
        {hasData ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label={title}
          >
            <path d={area} fill="currentColor" fillOpacity={0.12} stroke="none" />
            <path
              d={line}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-line">
            <span className="font-kufi text-xs text-ink-faint">
              لا توجد بيانات في هذه الفترة
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function BreakdownList({
  title,
  rows,
  emptyLabel,
  tone = "default",
  formatValue = (n) => n.toLocaleString("en-US"),
}: {
  title: string;
  rows: AnalyticsBreakdownRow[];
  emptyLabel: string;
  tone?: Tone;
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-soft">
      <h3 className="font-kufi text-sm font-semibold text-ink">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-6 pb-2 text-center font-kufi text-xs text-ink-faint">
          {emptyLabel}
        </p>
      ) : (
        <ul className="mt-3 space-y-3">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-center justify-between gap-3">
                <span
                  className="min-w-0 truncate font-kufi text-xs text-ink-soft"
                  dir="auto"
                  title={row.label}
                >
                  {row.label}
                </span>
                <span className="shrink-0 font-kufi text-xs font-semibold text-ink">
                  {formatValue(row.value)}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-deep">
                <div
                  className={cn("h-full rounded-full bg-current", TONE_CLASS[tone])}
                  style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
