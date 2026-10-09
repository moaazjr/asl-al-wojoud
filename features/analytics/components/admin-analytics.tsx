"use client";

import * as React from "react";
import {
  Users,
  UserCheck,
  Activity,
  Eye,
  BookOpenCheck,
  FileDown,
  RefreshCw,
  AlertTriangle,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { TrendChart, BreakdownList } from "./trend-chart";
import {
  ANALYTICS_RANGES,
  type AnalyticsRange,
  type AnalyticsResponse,
} from "@/interfaces/analytics";

const RANGE_LABEL: Record<AnalyticsRange, string> = {
  7: "٧ أيام",
  30: "٣٠ يوماً",
  90: "٩٠ يوماً",
};

const numberFormatter = (value: number) => value.toLocaleString("en-US");

export function AdminAnalytics() {
  const [range, setRange] = React.useState<AnalyticsRange>(30);
  const [reloadKey, setReloadKey] = React.useState(0);
  const [data, setData] = React.useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const selectRange = React.useCallback((value: AnalyticsRange) => {
    setRange(value);
    setLoading(true);
    setError(null);
  }, []);

  const refresh = React.useCallback(() => {
    setLoading(true);
    setError(null);
    setReloadKey((key) => key + 1);
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    fetch(`/api/admin/analytics?range=${range}`, {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          throw new Error(body?.error ?? "تعذّر جلب بيانات التحليلات.");
        }
        return (await response.json()) as AnalyticsResponse;
      })
      .then((payload) => {
        if (!cancelled) setData(payload);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "حدث خطأ غير متوقّع.");
        setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range, reloadKey]);

  const configured = data?.configured === true;
  const notConfigured = data?.configured === false;
  const hasError = configured && "error" in data;

  const daily = configured && !hasError ? data.daily : [];
  const totalZero =
    configured &&
    !hasError &&
    data.overview.activeUsers === 0 &&
    data.overview.screenPageViews === 0 &&
    data.overview.chapterOpen === 0 &&
    data.overview.pdfDownload === 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-kufi text-2xl font-bold text-ink">تحليلات الموقع</h1>
          <p className="font-kufi text-sm text-ink-faint">
            مؤشّرات زوّار الكتاب الحقيقية من Google Analytics 4
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-line bg-card p-1">
            {ANALYTICS_RANGES.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => selectRange(value)}
                className={cn(
                  "rounded-md px-3 py-1.5 font-kufi text-xs font-medium transition-colors",
                  range === value
                    ? "bg-accent text-paper"
                    : "text-ink-soft hover:text-ink",
                )}
              >
                {RANGE_LABEL[value]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-2 font-kufi text-xs font-medium text-ink-soft transition-colors hover:text-ink disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            تحديث
          </button>
        </div>
      </div>

      {loading && <AnalyticsSkeleton />}

      {!loading && error && <ErrorState message={error} onRetry={refresh} />}

      {!loading && notConfigured && data && (
        <SetupRequiredState missing={data.missing} />
      )}

      {!loading && hasError && configured && (
        <ErrorState
          message={(data as { error: string }).error}
          onRetry={refresh}
        />
      )}

      {!loading && configured && !hasError && (
        <>
          {totalZero && (
            <div className="rounded-xl border border-line bg-card p-4 font-kufi text-sm text-ink-faint">
              لا توجد بيانات مسجّلة في هذه الفترة بعد. ستظهر المؤشّرات بمجرّد
              وصول الزيارات.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              label="الزوّار النشطون"
              value={numberFormatter(data.overview.activeUsers)}
              icon={Users}
              tone="sky"
              hint={`خلال ${RANGE_LABEL[range]}`}
            />
            <StatCard
              label="إجمالي المستخدمين"
              value={numberFormatter(data.overview.totalUsers)}
              icon={UserCheck}
              tone="emerald"
            />
            <StatCard
              label="الجلسات"
              value={numberFormatter(data.overview.sessions)}
              icon={Activity}
            />
            <StatCard
              label="مشاهدات الصفحات"
              value={numberFormatter(data.overview.screenPageViews)}
              icon={Eye}
              tone="amber"
            />
            <StatCard
              label="فتح الفصول"
              value={numberFormatter(data.overview.chapterOpen)}
              icon={BookOpenCheck}
              tone="emerald"
            />
            <StatCard
              label="تنزيلات الكتاب"
              value={numberFormatter(data.overview.pdfDownload)}
              icon={FileDown}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            <TrendChart
              title="الزوّار النشطون يومياً"
              tone="sky"
              data={daily.map((point) => ({
                date: point.date,
                value: point.activeUsers,
              }))}
            />
            <TrendChart
              title="مشاهدات الصفحات يومياً"
              tone="amber"
              data={daily.map((point) => ({
                date: point.date,
                value: point.screenPageViews,
              }))}
            />
            <TrendChart
              title="فتح الفصول يومياً"
              tone="emerald"
              data={daily.map((point) => ({
                date: point.date,
                value: point.chapterOpen,
              }))}
            />
            <TrendChart
              title="تنزيلات الكتاب يومياً"
              tone="default"
              data={daily.map((point) => ({
                date: point.date,
                value: point.pdfDownload,
              }))}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <BreakdownList
              title="أكثر الفصول فتحاً"
              rows={data.topChapters}
              emptyLabel="لا توجد عمليات فتح فصول بعد."
              tone="emerald"
            />
            <BreakdownList
              title="أكثر الصفحات زيارةً"
              rows={data.topPages}
              emptyLabel="لا توجد مشاهدات صفحات بعد."
              tone="amber"
            />
            <BreakdownList
              title="مصادر الزيارات"
              rows={data.sources}
              emptyLabel="لا توجد بيانات مصادر بعد."
              tone="sky"
            />
            <BreakdownList
              title="الدول"
              rows={data.countries}
              emptyLabel="لا توجد بيانات جغرافية بعد."
            />
          </div>

          <p className="font-kufi text-xs text-ink-faint">
            آخر تحديث:{" "}
            {new Date(data.generatedAt).toLocaleString("ar", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </>
      )}
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-line bg-paper-deep/40"
          />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-44 animate-pulse rounded-2xl border border-line bg-paper-deep/40"
          />
        ))}
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-8 text-center">
      <AlertTriangle className="h-7 w-7 text-rose-600 dark:text-rose-400" />
      <p className="font-kufi text-sm font-medium text-ink">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 font-kufi text-sm font-medium text-paper transition-colors hover:bg-accent-bright"
      >
        <RefreshCw className="h-4 w-4" />
        إعادة المحاولة
      </button>
    </div>
  );
}

function SetupRequiredState({ missing }: { missing: string[] }) {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
      <div className="flex items-center gap-2">
        <Settings2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        <h2 className="font-kufi text-lg font-bold text-ink">
          يتطلّب إعداد Google Analytics
        </h2>
      </div>
      <p className="mt-2 font-kufi text-sm text-ink-soft">
        لوحة التحليلات جاهزة، لكنّها تحتاج بيانات اعتماد خدمة Google Analytics
        Data API على الخادم. أضف المتغيّرات التالية إلى ملف{" "}
        <code className="rounded bg-paper-deep px-1.5 py-0.5" dir="ltr">
          .env
        </code>{" "}
        ثم أعد تشغيل الخادم:
      </p>
      <ul className="mt-4 space-y-1.5">
        {missing.map((key) => (
          <li
            key={key}
            className="font-kufi text-sm font-medium text-ink"
            dir="ltr"
          >
            <code className="rounded bg-paper-deep px-2 py-1">{key}</code>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-kufi text-xs leading-relaxed text-ink-faint">
        أنشئ حساب خدمة في Google Cloud، ثم أضف بريده في GA4 بصلاحية «القراءة»
        على الخاصية المطلوبة. استخدم معرّف الخاصية الرقمي (GA4_PROPERTY_ID)
        وليس معرّف القياس (G-…).
      </p>
    </div>
  );
}
