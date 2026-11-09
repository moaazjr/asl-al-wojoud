"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  UserPlus,
  Activity,
  Eye,
  BookOpenCheck,
  FileDown,
  RefreshCw,
  AlertTriangle,
  Settings2,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  Globe2,
  MessageSquareText,
  Hourglass,
  CheckCircle2,
  XCircle,
  Info,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { StatCard } from "@/features/dashboard/components/stat-card";
import { TrendChart, BreakdownList } from "./trend-chart";
import {
  ANALYTICS_PRESETS,
  shiftIsoDate,
  todayIso,
  type AnalyticsPreset,
  type AnalyticsRangeKey,
  type AnalyticsResponse,
  type Ga4Data,
} from "@/interfaces/analytics";

const PRESET_LABEL: Record<AnalyticsPreset, string> = {
  today: "اليوم",
  "7": "٧ أيام",
  "30": "٣٠ يومًا",
  "90": "٩٠ يومًا",
};

const fmt = (value: number) => value.toLocaleString("en-US");

function formatIso(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("ar", { dateStyle: "medium", timeZone: "UTC" });
}

interface Query {
  range: AnalyticsRangeKey;
  start?: string;
  end?: string;
}

export function AdminAnalytics() {
  const [query, setQuery] = React.useState<Query>({ range: "30" });
  const [customOpen, setCustomOpen] = React.useState(false);
  const [customStart, setCustomStart] = React.useState(() => shiftIsoDate(todayIso(), -13));
  const [customEnd, setCustomEnd] = React.useState(() => todayIso());
  const [reload, setReload] = React.useState({ key: 0, fresh: false });
  const [data, setData] = React.useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({ range: query.range });
    if (query.range === "custom" && query.start && query.end) {
      params.set("start", query.start);
      params.set("end", query.end);
    }
    if (reload.fresh) params.set("fresh", "1");

    fetch(`/api/admin/analytics?${params.toString()}`, {
      credentials: "same-origin",
      cache: "no-store",
    })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(body?.error ?? "تعذّر جلب بيانات التحليلات.");
        }
        return body as AnalyticsResponse;
      })
      .then((payload) => {
        if (cancelled) return;
        setData(payload);
        setError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "حدث خطأ غير متوقّع.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, reload]);

  function selectPreset(range: AnalyticsPreset) {
    setCustomOpen(false);
    if (query.range === range) return;
    setLoading(true);
    setQuery({ range });
  }

  function applyCustom(e: React.FormEvent) {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    setLoading(true);
    setQuery({ range: "custom", start: customStart, end: customEnd });
  }

  function refresh() {
    setLoading(true);
    setReload((r) => ({ key: r.key + 1, fresh: true }));
  }

  const ga4 = data?.ga4;
  const ga = ga4?.state === "ok" ? ga4.data : null;
  const comments = data?.comments ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="font-kufi text-2xl font-bold text-ink">تحليلات الموقع</h1>
          <p className="font-kufi text-sm text-ink-faint">
            بيانات حقيقية من Google Analytics 4 وقاعدة بيانات التعليقات
            {data && (
              <>
                {" · "}
                <span className="text-ink-soft">
                  {formatIso(data.period.startDate)}
                  {data.period.startDate !== data.period.endDate && ` — ${formatIso(data.period.endDate)}`}
                </span>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap rounded-lg border border-line bg-card p-1" role="group" aria-label="الفترة الزمنية">
            {ANALYTICS_PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => selectPreset(value)}
                aria-pressed={query.range === value}
                className={cn(
                  "rounded-md px-3 py-1.5 font-kufi text-xs font-medium transition-colors",
                  query.range === value ? "bg-accent text-paper" : "text-ink-soft hover:text-ink",
                )}
              >
                {PRESET_LABEL[value]}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCustomOpen((v) => !v)}
              aria-pressed={query.range === "custom"}
              aria-expanded={customOpen}
              className={cn(
                "inline-flex items-center gap-1 rounded-md px-3 py-1.5 font-kufi text-xs font-medium transition-colors",
                query.range === "custom" ? "bg-accent text-paper" : "text-ink-soft hover:text-ink",
              )}
            >
              <CalendarRange className="h-3.5 w-3.5" />
              مخصّص
            </button>
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

      {customOpen && (
        <form
          onSubmit={applyCustom}
          className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-card p-3"
        >
          <label className="flex flex-col gap-1 font-kufi text-xs text-ink-soft">
            من
            <input
              type="date"
              value={customStart}
              max={customEnd || todayIso()}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-md border border-line bg-paper px-2 py-1.5 text-sm text-ink"
              dir="ltr"
              required
            />
          </label>
          <label className="flex flex-col gap-1 font-kufi text-xs text-ink-soft">
            إلى
            <input
              type="date"
              value={customEnd}
              min={customStart}
              max={todayIso()}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-md border border-line bg-paper px-2 py-1.5 text-sm text-ink"
              dir="ltr"
              required
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 font-kufi text-xs font-semibold text-paper hover:bg-accent-bright"
          >
            تطبيق
          </button>
        </form>
      )}

      {loading && !data && <AnalyticsSkeleton />}

      {error && <ErrorState message={error} onRetry={refresh} />}

      {data && (
        <div className={cn("space-y-6 transition-opacity", loading && "opacity-60")} aria-busy={loading}>
          <CommentsBlock stats={comments} error={data.commentsError} />

          {ga4?.state === "not-configured" && <SetupRequiredState missing={ga4.missing} />}
          {ga4?.state === "error" && (
            <ErrorState message={ga4.message} detail={ga4.detail} onRetry={refresh} />
          )}
          {ga && <Ga4Block data={ga} rangeKey={data.period.key} />}

          <p className="font-kufi text-xs text-ink-faint">
            آخر تحديث:{" "}
            {new Date(data.generatedAt).toLocaleString("ar", { dateStyle: "medium", timeStyle: "short" })}
            {" · "}تُخزَّن بيانات GA4 مؤقتًا لمدة ٥ دقائق؛ زر «تحديث» يجلبها من جديد.
          </p>
        </div>
      )}
    </div>
  );
}

function CommentsBlock({
  stats,
  error,
}: {
  stats: AnalyticsResponse["comments"];
  error?: string;
}) {
  if (!stats) {
    return error ? (
      <p role="alert" className="rounded-lg border border-rose-300/50 bg-rose-500/5 px-3 py-2 font-kufi text-xs text-rose-600 dark:text-rose-400">
        {error}
      </p>
    ) : null;
  }
  return (
    <section aria-labelledby="comments-stats" className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 id="comments-stats" className="font-kufi text-sm font-semibold text-ink">
          تعليقات الزوّار
        </h2>
        <Link
          href="/dashboard/comments"
          className="ms-auto font-kufi text-xs text-ink-faint hover:text-accent"
        >
          إدارة التعليقات
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          <StatCard label="تعليقات مُرسلة في الفترة" value={fmt(stats.submittedInPeriod)} icon={MessageSquareText} />
          <StatCard label="بانتظار المراجعة" value={fmt(stats.pending)} icon={Hourglass} tone="amber" hint="الإجمالي الحالي" />
          <StatCard label="معتمدة" value={fmt(stats.approved)} icon={CheckCircle2} tone="emerald" hint="الإجمالي الحالي" />
          <StatCard label="مرفوضة" value={fmt(stats.rejected)} icon={XCircle} tone="sky" hint="الإجمالي الحالي" />
        </div>
        <TrendChart title="التعليقات المرسلة يوميًا" data={stats.daily} tone="default" />
      </div>
    </section>
  );
}

function Ga4Block({ data, rangeKey }: { data: Ga4Data; rangeKey: AnalyticsRangeKey }) {
  const { overview, visitors, daily } = data;
  const noDataEver =
    visitors.allTime === 0 && overview.screenPageViews === 0 && !data.realtimeActiveUsers;
  const awaitingProcessing =
    visitors.allTime === 0 && overview.screenPageViews === 0 && (data.realtimeActiveUsers ?? 0) > 0;
  const periodLabel = rangeKey === "custom" ? "في الفترة المختارة" : rangeKey === "today" ? "اليوم" : `آخر ${PRESET_LABEL[rangeKey as AnalyticsPreset]}`;

  return (
    <div className="space-y-6">
      {noDataEver && (
        <div className="flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1 font-kufi text-sm text-ink-soft">
            <p className="font-semibold text-ink">
              الاتصال بـ GA4 يعمل، لكن الخاصية {data.propertyId} لم تسجّل أي زيارة على الإطلاق.
            </p>
            <p className="text-xs leading-relaxed">
              إن كان الموقع قد نُشر حديثًا بمعرّف القياس الصحيح، فهذا طبيعي: يعالج Google Analytics البيانات
              خلال 24 إلى 48 ساعة، ويمكنك رؤية الزيارات الحالية فورًا من «التقارير ← الوقت الفعلي» داخل GA4.
              إن استمرّ ذلك أكثر من يومين، فتأكّد أن معرّف القياس في الموقع (G-QQHBWPCYLE)
              هو نفسه معرّف مصدر البيانات داخل الخاصية {data.propertyId}.
            </p>
          </div>
        </div>
      )}
      {awaitingProcessing && (
        <div className="flex gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />
          <p className="font-kufi text-sm leading-relaxed text-ink-soft">
            التتبّع يعمل: هناك زوّار على الموقع الآن. لكن Google Analytics يعالج التقارير اليومية بتأخير
            24 إلى 48 ساعة، لذلك تظهر بقية المؤشّرات صفرًا مؤقتًا وستمتلئ تلقائيًا.
          </p>
        </div>
      )}
      {data.partialFailures.length > 0 && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 font-kufi text-xs text-amber-700 dark:text-amber-400">
          تعذّر تحميل بعض التقارير ({data.partialFailures.join("، ")}). القيم المعروضة الأخرى صحيحة.
        </p>
      )}

      <section aria-labelledby="visitors-heading" className="space-y-3">
        <h2 id="visitors-heading" className="font-kufi text-sm font-semibold text-ink">الزوّار</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard
            label="على الموقع الآن"
            value={data.realtimeActiveUsers == null ? "—" : fmt(data.realtimeActiveUsers)}
            icon={Radio}
            tone="emerald"
            hint="آخر 30 دقيقة (مباشر)"
          />
          <StatCard label="زوّار اليوم" value={fmt(visitors.today)} icon={CalendarClock} tone="sky" />
          <StatCard label="زوّار آخر ٧ أيام" value={fmt(visitors.last7Days)} icon={CalendarDays} tone="sky" />
          <StatCard label="زوّار آخر ٣٠ يومًا" value={fmt(visitors.last30Days)} icon={CalendarRange} tone="sky" />
          <StatCard label="إجمالي الزوّار" value={fmt(visitors.allTime)} icon={Globe2} tone="emerald" hint="منذ بدء التتبّع" />
        </div>
      </section>

      <section aria-labelledby="period-heading" className="space-y-3">
        <h2 id="period-heading" className="font-kufi text-sm font-semibold text-ink">
          مؤشّرات الفترة ({periodLabel})
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="الزوّار النشطون" value={fmt(overview.activeUsers)} icon={Users} tone="sky" />
          <StatCard label="زوّار جدد" value={fmt(overview.newUsers)} icon={UserPlus} tone="emerald" />
          <StatCard label="الجلسات" value={fmt(overview.sessions)} icon={Activity} />
          <StatCard label="مشاهدات الصفحات" value={fmt(overview.screenPageViews)} icon={Eye} tone="amber" />
          <StatCard label="فتح الفصول" value={fmt(overview.chapterOpen)} icon={BookOpenCheck} tone="emerald" hint="حدث chapter_open" />
          <StatCard label="تنزيلات PDF" value={fmt(overview.pdfDownload)} icon={FileDown} hint="حدث pdf_download" />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <TrendChart title="الزوّار النشطون يوميًا" tone="sky" data={daily.map((p) => ({ date: p.date, value: p.activeUsers }))} />
        <TrendChart title="مشاهدات الصفحات يوميًا" tone="amber" data={daily.map((p) => ({ date: p.date, value: p.screenPageViews }))} />
        <TrendChart title="فتح الفصول يوميًا" tone="emerald" data={daily.map((p) => ({ date: p.date, value: p.chapterOpen }))} />
        <TrendChart title="تنزيلات PDF يوميًا" data={daily.map((p) => ({ date: p.date, value: p.pdfDownload }))} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BreakdownList title="مصادر الزيارات (الجلسات)" rows={data.sources} emptyLabel="لا توجد بيانات مصادر بعد." tone="sky" showShare />
        <BreakdownList title="الزوّار حسب الدولة" rows={data.countries} emptyLabel="لا توجد بيانات جغرافية بعد." showShare />
        <BreakdownList title="أكثر الأبواب زيارةً" rows={data.topChapters} emptyLabel="لا توجد مشاهدات للأبواب بعد." tone="emerald" />
        <BreakdownList title="أكثر المباحث زيارةً" rows={data.topSections} emptyLabel="لا توجد مشاهدات للمباحث بعد." tone="emerald" />
        <BreakdownList title="أكثر الصفحات زيارةً" rows={data.topPages} emptyLabel="لا توجد مشاهدات صفحات بعد." tone="amber" />
        <BreakdownList title="المصادر التفصيلية" rows={data.rawSources} emptyLabel="لا توجد بيانات مصادر بعد." tone="sky" />
      </div>
    </div>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-2xl border border-line bg-paper-deep/40" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-48 animate-pulse rounded-2xl border border-line bg-paper-deep/40" />
        ))}
      </div>
    </div>
  );
}

function ErrorState({
  message,
  detail,
  onRetry,
}: {
  message: string;
  detail?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/5 p-8 text-center">
      <AlertTriangle className="h-7 w-7 text-rose-600 dark:text-rose-400" />
      <p className="font-kufi text-sm font-medium text-ink">{message}</p>
      {detail && (
        <details className="max-w-full text-start">
          <summary className="cursor-pointer font-kufi text-xs text-ink-faint">التفاصيل التقنية</summary>
          <pre dir="ltr" className="mt-2 max-w-full overflow-x-auto whitespace-pre-wrap break-all rounded bg-paper-deep p-2 text-[0.7rem] text-ink-soft">
            {detail}
          </pre>
        </details>
      )}
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
        <h2 className="font-kufi text-lg font-bold text-ink">يتطلّب إعداد Google Analytics</h2>
      </div>
      <p className="mt-2 font-kufi text-sm text-ink-soft">
        إحصاءات الزيارات تحتاج بيانات اعتماد Google Analytics Data API على الخادم. المتغيّرات الناقصة:
      </p>
      <ul className="mt-4 space-y-1.5">
        {missing.map((key) => (
          <li key={key} className="font-kufi text-sm font-medium text-ink" dir="ltr">
            <code className="rounded bg-paper-deep px-2 py-1">{key}</code>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-kufi text-xs leading-relaxed text-ink-faint">
        أنشئ حساب خدمة في Google Cloud وفعّل Google Analytics Data API، ثم أضف بريد الحساب في GA4 بصلاحية
        «القراءة» على الخاصية. استخدم معرّف الخاصية الرقمي (GA4_PROPERTY_ID) وليس معرّف القياس (G-…).
      </p>
    </div>
  );
}
