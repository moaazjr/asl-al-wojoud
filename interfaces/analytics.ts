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

export const ANALYTICS_TIME_ZONE = "Asia/Damascus";

const zoneParts = new Intl.DateTimeFormat("en-US", {
  timeZone: ANALYTICS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function partsInZone(date: Date) {
  const map: Record<string, number> = {};
  for (const p of zoneParts.formatToParts(date)) {
    if (p.type !== "literal") map[p.type] = Number(p.value);
  }
  return map;
}

function zoneOffsetMs(date: Date): number {
  const p = partsInZone(date);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

export function isoDateInZone(date: Date): string {
  const p = partsInZone(date);
  return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

export function startOfDayInZone(iso: string): Date {
  const guess = Date.parse(`${iso}T00:00:00Z`);
  const first = guess - zoneOffsetMs(new Date(guess));
  return new Date(guess - zoneOffsetMs(new Date(first)));
}

export function todayIso(): string {
  return isoDateInZone(new Date());
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
  realtimeActiveUsers: number | null;
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
  partialFailureDetails?: { report: string; message: string; detail: string }[];
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
