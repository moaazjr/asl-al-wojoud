export const ANALYTICS_PRESETS = ["today", "7", "30", "90"] as const;

export type AnalyticsPreset = (typeof ANALYTICS_PRESETS)[number];

export type AnalyticsRangeKey = AnalyticsPreset | "custom";

export interface AnalyticsPeriod {
  key: AnalyticsRangeKey;
  startDate: string;
  endDate: string;
}

export const MAX_CUSTOM_RANGE_DAYS = 366;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function shiftIsoDate(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function resolvePeriod(
  range: string | null,
  start: string | null,
  end: string | null,
  today: string = todayIso(),
): AnalyticsPeriod | { error: string } {
  if (range === "custom") {
    if (!start || !end || !isValidIsoDate(start) || !isValidIsoDate(end)) {
      return { error: "صيغة التاريخ غير صالحة (YYYY-MM-DD)." };
    }
    if (start > end) return { error: "تاريخ البداية بعد تاريخ النهاية." };
    if (end > today) return { error: "لا يمكن اختيار تاريخ في المستقبل." };
    const span =
      (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86_400_000 + 1;
    if (span > MAX_CUSTOM_RANGE_DAYS) {
      return { error: `أقصى مدة مسموحة ${MAX_CUSTOM_RANGE_DAYS} يومًا.` };
    }
    return { key: "custom", startDate: start, endDate: end };
  }
  const preset = (ANALYTICS_PRESETS as readonly string[]).includes(range ?? "")
    ? (range as AnalyticsPreset)
    : "30";
  const days = preset === "today" ? 1 : Number(preset);
  return { key: preset, startDate: shiftIsoDate(today, -(days - 1)), endDate: today };
}

export interface AnalyticsOverview {
  activeUsers: number;
  totalUsers: number;
  newUsers: number;
  sessions: number;
  screenPageViews: number;
  chapterOpen: number;
  pdfDownload: number;
}

export interface VisitorsSummary {
  today: number;
  last7Days: number;
  last30Days: number;
  allTime: number;
}

export interface AnalyticsDailyPoint {
  date: string;
  activeUsers: number;
  screenPageViews: number;
  chapterOpen: number;
  pdfDownload: number;
}

export interface AnalyticsBreakdownRow {
  label: string;
  value: number;
  hint?: string;
}

export interface CommentStats {
  submittedInPeriod: number;
  pending: number;
  approved: number;
  rejected: number;
  total: number;
  daily: { date: string; value: number }[];
}

export interface Ga4Data {
  propertyId: string;
  overview: AnalyticsOverview;
  visitors: VisitorsSummary;
  daily: AnalyticsDailyPoint[];
  topPages: AnalyticsBreakdownRow[];
  topSections: AnalyticsBreakdownRow[];
  topChapters: AnalyticsBreakdownRow[];
  sources: AnalyticsBreakdownRow[];
  rawSources: AnalyticsBreakdownRow[];
  countries: AnalyticsBreakdownRow[];
  partialFailures: string[];
}

export type Ga4Status =
  | { state: "ok"; data: Ga4Data }
  | { state: "not-configured"; missing: string[] }
  | { state: "error"; message: string; detail?: string };

export interface AnalyticsResponse {
  period: AnalyticsPeriod;
  generatedAt: string;
  ga4: Ga4Status;
  comments: CommentStats | null;
  commentsError?: string;
}
