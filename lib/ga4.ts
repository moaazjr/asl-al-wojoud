import "server-only";
import { BetaAnalyticsDataClient, type protos } from "@google-analytics/data";
import type {
  AnalyticsBreakdownRow,
  AnalyticsDailyPoint,
  AnalyticsOverview,
  AnalyticsPeriod,
  Ga4Data,
  Ga4Status,
  VisitorsSummary,
} from "@/interfaces/analytics";
import { normalizePrivateKey, privateKeyProblem } from "@/lib/ga4-key";

const GA4_START_OF_TIME = "2015-08-14";
const CACHE_TTL_MS = 5 * 60 * 1000;

export const GA4_ENV_KEYS = [
  "GA4_PROPERTY_ID",
  "GA4_CLIENT_EMAIL",
  "GA4_PRIVATE_KEY",
] as const;

function env() {
  return {
    propertyId: process.env.GA4_PROPERTY_ID?.trim() ?? "",
    clientEmail: process.env.GA4_CLIENT_EMAIL?.trim() ?? "",
    privateKey: normalizePrivateKey(process.env.GA4_PRIVATE_KEY),
  };
}

export function missingGa4Env(): string[] {
  return GA4_ENV_KEYS.filter((key) => !process.env[key]?.trim());
}

export function isGa4Configured(): boolean {
  return missingGa4Env().length === 0;
}

let cachedClient: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient {
  if (!cachedClient) {
    const { clientEmail, privateKey } = env();
    cachedClient = new BetaAnalyticsDataClient({
      fallback: true,
      credentials: { client_email: clientEmail, private_key: privateKey },
    });
  }
  return cachedClient;
}

type ReportRequest = Parameters<BetaAnalyticsDataClient["runReport"]>[0];
type ReportResponse = protos.google.analytics.data.v1beta.IRunReportResponse;

interface RunResult {
  res: ReportResponse | null;
  error: unknown;
}

const MAX_ATTEMPTS = 3;
const RETRYABLE_CODES = new Set([4, 13, 14]);

function isRetryable(error: unknown): boolean {
  const code = (error as { code?: number | string })?.code;
  if (typeof code === "number") return RETRYABLE_CODES.has(code);
  return true;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function run(label: string, request: ReportRequest): Promise<RunResult> {
  let lastError: unknown = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const [res] = await getClient().runReport(request, { timeout: 20_000 });
      return { res, error: null };
    } catch (error) {
      lastError = error;
      if (!isRetryable(error) || attempt === MAX_ATTEMPTS) break;
      await sleep(400 * attempt);
    }
  }
  console.error(`[ga4] report "${label}" failed:`, describeError(lastError).detail);
  return { res: null, error: lastError };
}

function describeError(error: unknown): { message: string; detail: string } {
  const code = (error as { code?: number })?.code;
  const raw = error instanceof Error ? error.message : String(error);
  const detail = raw.slice(0, 300);
  if (/DECODER|PEM|private key|asn1/i.test(raw)) {
    return {
      message:
        "تعذّر قراءة GA4_PRIVATE_KEY على الخادم. انسخ قيمة private_key من ملف JSON الخاص بحساب الخدمة من جديد وضعها في متغيّرات البيئة.",
      detail,
    };
  }
  switch (code) {
    case 7:
      return {
        message:
          `حساب الخدمة ${process.env.GA4_CLIENT_EMAIL?.trim() || "(GA4_CLIENT_EMAIL)"} لا يملك صلاحية القراءة على الخاصية ${process.env.GA4_PROPERTY_ID?.trim() || ""}. أضِفه من Google Analytics ← Admin ← Property access management بدور Viewer، أو تأكّد أن Google Analytics Data API مفعّلة في مشروع Google Cloud.`,
        detail,
      };
    case 16:
      return {
        message: "بيانات اعتماد حساب الخدمة غير صالحة (GA4_CLIENT_EMAIL / GA4_PRIVATE_KEY).",
        detail,
      };
    case 5:
      return { message: "خاصية GA4 غير موجودة. تحقّق من GA4_PROPERTY_ID.", detail };
    case 3:
      return { message: "طلب غير صالح إلى GA4 Data API.", detail };
    case 8:
      return { message: "تم تجاوز حصة طلبات GA4 Data API مؤقتًا. حاول لاحقًا.", detail };
    case 4:
    case 14:
      return {
        message: "انتهت مهلة الاتصال بـ Google Analytics أو أن الخدمة غير متاحة مؤقتًا. أعد المحاولة بعد قليل.",
        detail,
      };
    default:
      return {
        message: "تعذّر الاتصال بـ Google Analytics Data API (مشكلة شبكة على الأغلب). أعد المحاولة بعد قليل.",
        detail: code !== undefined ? `[${String(code)}] ${detail}` : detail,
      };
  }
}

function toNumber(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatGaDate(value: string): string {
  if (!/^\d{8}$/.test(value)) return value;
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

function gaDateRange(period: AnalyticsPeriod) {
  if (period.key === "custom") {
    return { startDate: period.startDate, endDate: period.endDate };
  }
  const days = period.key === "today" ? 1 : Number(period.key);
  return {
    startDate: days === 1 ? "today" : `${days - 1}daysAgo`,
    endDate: "today",
  };
}

const SOURCE_GROUPS: { label: string; test: RegExp }[] = [
  { label: "مباشر", test: /^\(direct\)$/ },
  { label: "Google", test: /(^|\.)google(\.|$)|^google$/ },
  { label: "Facebook", test: /facebook|^fb$|^m\.facebook|^l\.facebook|^lm\.facebook/ },
  { label: "WhatsApp", test: /whatsapp|^wa\.me$|^l\.wl\.co$/ },
  { label: "Instagram", test: /instagram/ },
  { label: "X / Twitter", test: /^t\.co$|twitter|^x\.com$/ },
  { label: "Telegram", test: /telegram|^t\.me$/ },
  { label: "YouTube", test: /youtube/ },
  { label: "Bing", test: /bing/ },
  { label: "غير محدد", test: /^\(not set\)$/ },
];

export function groupSource(source: string): string {
  const normalized = source.trim().toLowerCase();
  return SOURCE_GROUPS.find((g) => g.test.test(normalized))?.label ?? source;
}

function sortedTop(map: Map<string, AnalyticsBreakdownRow>, limit: number) {
  return Array.from(map.values())
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

const SECTION_PATH = /^\/(\d+)\/[^/]+\/?$/;
const CHAPTER_PATH = /^\/(\d+)(\/|$)/;

const cache = new Map<string, { at: number; value: Ga4Status }>();

export async function fetchGa4(
  period: AnalyticsPeriod,
  { fresh = false }: { fresh?: boolean } = {},
): Promise<Ga4Status> {
  const missing = missingGa4Env();
  if (missing.length > 0) return { state: "not-configured", missing };

  const keyProblem = privateKeyProblem(env().privateKey);
  if (keyProblem) {
    return { state: "error", message: keyProblem };
  }

  const cacheKey = `${period.key}:${period.startDate}:${period.endDate}`;
  const hit = cache.get(cacheKey);
  if (!fresh && hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value;

  const { propertyId } = env();
  const property = `properties/${propertyId}`;
  const dateRanges = [gaDateRange(period)];
  const eventFilter = {
    filter: {
      fieldName: "eventName",
      inListFilter: { values: ["chapter_open", "pdf_download"] },
    },
  };

  const [overviewR, visitorsR, eventsR, dailyR, dailyEventsR, pagesR, sourcesR, countriesR] =
    await Promise.all([
      run("overview", {
        property,
        dateRanges,
        metrics: [
          { name: "activeUsers" },
          { name: "totalUsers" },
          { name: "newUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
        ],
      }),
      run("visitors", {
        property,
        dateRanges: [
          { startDate: "today", endDate: "today", name: "today" },
          { startDate: "6daysAgo", endDate: "today", name: "last7" },
          { startDate: "29daysAgo", endDate: "today", name: "last30" },
          { startDate: GA4_START_OF_TIME, endDate: "today", name: "all" },
        ],
        metrics: [{ name: "activeUsers" }],
      }),
      run("events", {
        property,
        dateRanges,
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: eventFilter,
      }),
      run("daily", {
        property,
        dateRanges,
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
        limit: 400,
      }),
      run("daily-events", {
        property,
        dateRanges,
        dimensions: [{ name: "date" }, { name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: eventFilter,
        limit: 1000,
      }),
      run("pages", {
        property,
        dateRanges,
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 500,
      }),
      run("sources", {
        property,
        dateRanges,
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 100,
      }),
      run("countries", {
        property,
        dateRanges,
        dimensions: [{ name: "country" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 15,
      }),
    ]);

  const realtimeActiveUsers = await getClient()
    .runRealtimeReport(
      { property, metrics: [{ name: "activeUsers" }], minuteRanges: [{ startMinutesAgo: 29, endMinutesAgo: 0 }] },
      { timeout: 15_000 },
    )
    .then(([rt]) => toNumber(rt.rows?.[0]?.metricValues?.[0]?.value))
    .catch((error: unknown) => {
      console.error("[ga4] realtime report failed:", describeError(error).detail);
      return null;
    });

  if (!overviewR.res) {
    const { message, detail } = describeError(overviewR.error);
    return { state: "error", message, detail };
  }

  const partialFailures = Object.entries({
    visitors: visitorsR,
    events: eventsR,
    daily: dailyR,
    dailyEvents: dailyEventsR,
    pages: pagesR,
    sources: sourcesR,
    countries: countriesR,
  })
    .filter(([, r]) => !r.res)
    .map(([name]) => name);

  const ov = overviewR.res.rows?.[0]?.metricValues ?? [];
  const overview: AnalyticsOverview = {
    activeUsers: toNumber(ov[0]?.value),
    totalUsers: toNumber(ov[1]?.value),
    newUsers: toNumber(ov[2]?.value),
    sessions: toNumber(ov[3]?.value),
    screenPageViews: toNumber(ov[4]?.value),
    chapterOpen: 0,
    pdfDownload: 0,
  };
  for (const row of eventsR.res?.rows ?? []) {
    const name = row.dimensionValues?.[0]?.value;
    const count = toNumber(row.metricValues?.[0]?.value);
    if (name === "chapter_open") overview.chapterOpen = count;
    if (name === "pdf_download") overview.pdfDownload = count;
  }

  const visitors: VisitorsSummary = { today: 0, last7Days: 0, last30Days: 0, allTime: 0 };
  for (const row of visitorsR.res?.rows ?? []) {
    const name = row.dimensionValues?.[0]?.value;
    const value = toNumber(row.metricValues?.[0]?.value);
    if (name === "today") visitors.today = value;
    if (name === "last7") visitors.last7Days = value;
    if (name === "last30") visitors.last30Days = value;
    if (name === "all") visitors.allTime = value;
  }

  const dailyMap = new Map<string, AnalyticsDailyPoint>();
  const point = (date: string) => {
    let p = dailyMap.get(date);
    if (!p) {
      p = { date, activeUsers: 0, screenPageViews: 0, chapterOpen: 0, pdfDownload: 0 };
      dailyMap.set(date, p);
    }
    return p;
  };
  for (const row of dailyR.res?.rows ?? []) {
    const p = point(formatGaDate(row.dimensionValues?.[0]?.value ?? ""));
    p.activeUsers = toNumber(row.metricValues?.[0]?.value);
    p.screenPageViews = toNumber(row.metricValues?.[1]?.value);
  }
  for (const row of dailyEventsR.res?.rows ?? []) {
    const p = point(formatGaDate(row.dimensionValues?.[0]?.value ?? ""));
    const name = row.dimensionValues?.[1]?.value;
    const count = toNumber(row.metricValues?.[0]?.value);
    if (name === "chapter_open") p.chapterOpen = count;
    if (name === "pdf_download") p.pdfDownload = count;
  }
  const daily = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  const pages = new Map<string, AnalyticsBreakdownRow>();
  const sections = new Map<string, AnalyticsBreakdownRow>();
  const chapters = new Map<string, AnalyticsBreakdownRow>();
  for (const row of pagesR.res?.rows ?? []) {
    const path = row.dimensionValues?.[0]?.value ?? "";
    const title = (row.dimensionValues?.[1]?.value ?? "").replace(/\s*·\s*أصل الوجود\s*$/, "");
    const views = toNumber(row.metricValues?.[0]?.value);
    if (!path) continue;
    const add = (map: Map<string, AnalyticsBreakdownRow>, key: string, label: string, hint?: string) => {
      const existing = map.get(key);
      if (existing) existing.value += views;
      else map.set(key, { label, value: views, hint });
    };
    add(pages, path, title && title !== "(not set)" ? title : path, path);
    if (SECTION_PATH.test(path)) add(sections, path, title || path, path);
    const chapter = CHAPTER_PATH.exec(path)?.[1];
    if (chapter) add(chapters, chapter, `الباب ${chapter}`, `/${chapter}`);
  }

  const rawSources: AnalyticsBreakdownRow[] = (sourcesR.res?.rows ?? []).map((row) => ({
    label: row.dimensionValues?.[0]?.value ?? "",
    value: toNumber(row.metricValues?.[0]?.value),
  }));
  const grouped = new Map<string, AnalyticsBreakdownRow>();
  for (const s of rawSources) {
    const label = groupSource(s.label);
    const existing = grouped.get(label);
    if (existing) existing.value += s.value;
    else grouped.set(label, { label, value: s.value });
  }

  const data: Ga4Data = {
    propertyId,
    realtimeActiveUsers,
    overview,
    visitors,
    daily,
    topPages: sortedTop(pages, 10),
    topSections: sortedTop(sections, 10),
    topChapters: sortedTop(chapters, 10),
    sources: sortedTop(grouped, 10),
    rawSources: rawSources.slice(0, 15),
    countries: (countriesR.res?.rows ?? [])
      .map((row) => ({
        label: row.dimensionValues?.[0]?.value ?? "",
        value: toNumber(row.metricValues?.[0]?.value),
      }))
      .filter((r) => r.label),
    partialFailures,
  };

  const value: Ga4Status = { state: "ok", data };
  cache.set(cacheKey, { at: Date.now(), value });
  return value;
}
