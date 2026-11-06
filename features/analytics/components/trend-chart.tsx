"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { AnalyticsBreakdownRow } from "@/interfaces/analytics";

const TONE_CLASS = {
  default: "text-accent",
  sky: "text-sky-600 dark:text-sky-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
} as const;

type Tone = keyof typeof TONE_CLASS;

const defaultFormat = (n: number) => n.toLocaleString("en-US");

function formatDay(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ar", { day: "numeric", month: "short", timeZone: "UTC" });
}

export function TrendChart({
  title,
  data,
  tone = "default",
  formatValue = defaultFormat,
  className,
}: {
  title: string;
  data: { date: string; value: number }[];
  tone?: Tone;
  formatValue?: (value: number) => string;
  className?: string;
}) {
  const [hover, setHover] = React.useState<number | null>(null);
  const values = data.map((point) => point.value);
  const total = values.reduce((sum, value) => sum + value, 0);
  const max = Math.max(1, ...values);
  const hasData = values.length > 0 && total > 0;

  const W = 100;
  const H = 40;
  const single = values.length === 1;
  const step = values.length > 1 ? W / (values.length - 1) : 0;
  const points = values.map((value, index) => {
    const x = single ? W / 2 : index * step;
    const y = H - (value / max) * (H - 4) - 2;
    return [x, y] as const;
  });
  const line = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
  const area = points.length > 1 ? `${line} L${W},${H} L0,${H} Z` : "";

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!values.length) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setHover(single ? 0 : Math.round(ratio * (values.length - 1)));
  }

  const active = hover != null ? data[hover] : null;
  const activePoint = hover != null ? points[hover] : null;

  return (
    <div className={cn("rounded-2xl border border-line bg-card p-4 shadow-soft", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-kufi text-sm font-semibold text-ink">{title}</h3>
        <span className="font-amiri text-xl font-bold text-ink">{formatValue(total)}</span>
      </div>
      <p className="mt-0.5 h-4 font-kufi text-[0.7rem] text-ink-faint" aria-live="polite">
        {active ? `${formatDay(active.date)}: ${formatValue(active.value)}` : data.length > 0
          ? `${formatDay(data[0].date)} — ${formatDay(data[data.length - 1].date)}`
          : ""}
      </p>
      <div
        dir="ltr"
        className={cn("relative mt-2 h-28 w-full touch-none", TONE_CLASS[tone])}
        onPointerMove={hasData ? onMove : undefined}
        onPointerDown={hasData ? onMove : undefined}
        onPointerLeave={() => setHover(null)}
      >
        {hasData ? (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label={`${title}: ${formatValue(total)}`}
          >
            {area && <path d={area} fill="currentColor" fillOpacity={0.12} stroke="none" />}
            {points.length > 1 && (
              <path
                d={line}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {single && (
              <line
                x1={W / 2}
                x2={W / 2}
                y1={H}
                y2={points[0][1]}
                stroke="currentColor"
                strokeWidth={6}
                vectorEffect="non-scaling-stroke"
              />
            )}
            {activePoint && (
              <>
                <line
                  x1={activePoint[0]}
                  x2={activePoint[0]}
                  y1={0}
                  y2={H}
                  stroke="currentColor"
                  strokeOpacity={0.35}
                  strokeWidth={1}
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  cx={activePoint[0]}
                  cy={activePoint[1]}
                  r={1.6}
                  fill="currentColor"
                  stroke="var(--color-card, #fff)"
                  strokeWidth={1.5}
                  vectorEffect="non-scaling-stroke"
                />
              </>
            )}
          </svg>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-line">
            <span className="font-kufi text-xs text-ink-faint">لا توجد بيانات في هذه الفترة</span>
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
  formatValue = defaultFormat,
  showShare = false,
  footer,
}: {
  title: string;
  rows: AnalyticsBreakdownRow[];
  emptyLabel: string;
  tone?: Tone;
  formatValue?: (value: number) => string;
  showShare?: boolean;
  footer?: React.ReactNode;
}) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  const sum = rows.reduce((acc, row) => acc + row.value, 0) || 1;

  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-soft">
      <h3 className="font-kufi text-sm font-semibold text-ink">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-6 pb-2 text-center font-kufi text-xs text-ink-faint">{emptyLabel}</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {rows.map((row) => (
            <li key={row.hint ?? row.label} className="group" title={row.hint ?? row.label}>
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 truncate font-kufi text-xs text-ink-soft group-hover:text-ink" dir="auto">
                  {row.label}
                </span>
                <span className="shrink-0 font-kufi text-xs font-semibold text-ink">
                  {formatValue(row.value)}
                  {showShare && (
                    <span className="ms-1.5 font-normal text-ink-faint">
                      {Math.round((row.value / sum) * 100)}%
                    </span>
                  )}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-deep">
                <div
                  className={cn("h-full rounded-full bg-current transition-[width]", TONE_CLASS[tone])}
                  style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
      {footer}
    </div>
  );
}
