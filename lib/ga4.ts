import "server-only";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import type {
  AnalyticsBreakdownRow,
  AnalyticsDailyPoint,
  AnalyticsOverview,
  AnalyticsData,
  AnalyticsRange,
} from "@/interfaces/analytics";

const PROPERTY_ID = process.env.GA4_PROPERTY_ID?.trim();
const CLIENT_EMAIL = process.env.GA4_CLIENT_EMAIL?.trim();
const PRIVATE_KEY = process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, "\n")?.trim();

export const GA4_ENV_KEYS = [
  "GA4_PROPERTY_ID",
  "GA4_CLIENT_EMAIL",
  "GA4_PRIVATE_KEY",
] as const;

export function missingGa4Env(): string[] {
  return GA4_ENV_KEYS.filter((key) => {
    const value = process.env[key];
    return !value || !value.trim();
  });
}

export function isGa4Configured(): boolean {
  return Boolean(PROPERTY_ID && CLIENT_EMAIL && PRIVATE_KEY);
}

let cachedClient: BetaAnalyticsDataClient | null = null;

function getClient(): BetaAnalyticsDataClient {
  if (!cachedClient) {
    cachedClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: CLIENT_EMAIL as string,
        private_key: PRIVATE_KEY as string,
      },
    });
  }
  return cachedClient;
}

type ReportRequest = Parameters<BetaAnalyticsDataClient["runReport"]>[0];

async function safeRun(request: ReportRequest) {
  try {
    const [response] = await getClient().runReport(request);
    return response;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[ga4] report failed:", request.dimensions, error);
    }
    return null;
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

const EVENT_FILTER = {
  filter: {
    fieldName: "eventName",
    inListFilter: { values: ["chapter_open", "pdf_download"] },
  },
};

export async function fetchAnalytics(range: AnalyticsRange): Promise<AnalyticsData> {
  const property = `properties/${PROPERTY_ID}`;
  const dateRanges = [{ startDate: `${range}daysAgo`, endDate: "today" }];

  const [overviewRes, eventsRes, dailyRes, dailyEventsRes, pagesRes, chaptersRes, sourcesRes, countriesRes] =
    await Promise.all([
      safeRun({
        property,
        dateRanges,
        metrics: [
          { name: "activeUsers" },
          { name: "totalUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "eventCount" },
        ],
      }),
      safeRun({
        property,
        dateRanges,
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: EVENT_FILTER,
      }),
      safeRun({
        property,
        dateRanges,
        dimensions: [{ name: "date" }],
        metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
      }),
      safeRun({
        property,
        dateRanges,
        dimensions: [{ name: "date" }, { name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: EVENT_FILTER,
      }),
      safeRun({
        property,
        dateRanges,
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      }),
      safeRun({
        property,
        dateRanges,
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          filter: { fieldName: "eventName", stringFilter: { value: "chapter_open" } },
        },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
        limit: 10,
      }),
      safeRun({
        property,
        dateRanges,
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 10,
      }),
      safeRun({
        property,
        dateRanges,
        dimensions: [{ name: "country" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 10,
      }),
    ]);

  const overviewRow = overviewRes?.rows?.[0];
  const overview: AnalyticsOverview = {
    activeUsers: toNumber(overviewRow?.metricValues?.[0]?.value),
    totalUsers: toNumber(overviewRow?.metricValues?.[1]?.value),
    sessions: toNumber(overviewRow?.metricValues?.[2]?.value),
    screenPageViews: toNumber(overviewRow?.metricValues?.[3]?.value),
    chapterOpen: 0,
    pdfDownload: 0,
  };

  for (const row of eventsRes?.rows ?? []) {
    const name = row.dimensionValues?.[0]?.value;
    const count = toNumber(row.metricValues?.[0]?.value);
    if (name === "chapter_open") overview.chapterOpen = count;
    if (name === "pdf_download") overview.pdfDownload = count;
  }

  const dailyMap = new Map<string, AnalyticsDailyPoint>();
  for (const row of dailyRes?.rows ?? []) {
    const date = formatGaDate(row.dimensionValues?.[0]?.value ?? "");
    dailyMap.set(date, {
      date,
      activeUsers: toNumber(row.metricValues?.[0]?.value),
      screenPageViews: toNumber(row.metricValues?.[1]?.value),
      chapterOpen: 0,
      pdfDownload: 0,
    });
  }
  for (const row of dailyEventsRes?.rows ?? []) {
    const date = formatGaDate(row.dimensionValues?.[0]?.value ?? "");
    const name = row.dimensionValues?.[1]?.value;
    const count = toNumber(row.metricValues?.[0]?.value);
    const point =
      dailyMap.get(date) ??
      { date, activeUsers: 0, screenPageViews: 0, chapterOpen: 0, pdfDownload: 0 };
    if (name === "chapter_open") point.chapterOpen = count;
    if (name === "pdf_download") point.pdfDownload = count;
    dailyMap.set(date, point);
  }
  const daily = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  const toBreakdown = (
    res: Awaited<ReturnType<typeof safeRun>>,
  ): AnalyticsBreakdownRow[] =>
    (res?.rows ?? [])
      .map((row) => ({
        label: row.dimensionValues?.[0]?.value ?? "",
        value: toNumber(row.metricValues?.[0]?.value),
      }))
      .filter((row) => row.label);

  return {
    configured: true,
    range,
    propertyId: PROPERTY_ID ?? "",
    generatedAt: new Date().toISOString(),
    overview,
    daily,
    topPages: toBreakdown(pagesRes),
    topChapters: toBreakdown(chaptersRes),
    sources: toBreakdown(sourcesRes),
    countries: toBreakdown(countriesRes),
  };
}
