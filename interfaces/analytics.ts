export const ANALYTICS_RANGES = [7, 30, 90] as const;

export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export function isAnalyticsRange(value: unknown): value is AnalyticsRange {
  return ANALYTICS_RANGES.includes(value as AnalyticsRange);
}

export interface AnalyticsOverview {
  activeUsers: number;
  totalUsers: number;
  sessions: number;
  screenPageViews: number;
  chapterOpen: number;
  pdfDownload: number;
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
}

export interface AnalyticsData {
  configured: true;
  range: AnalyticsRange;
  propertyId: string;
  generatedAt: string;
  overview: AnalyticsOverview;
  daily: AnalyticsDailyPoint[];
  topPages: AnalyticsBreakdownRow[];
  topChapters: AnalyticsBreakdownRow[];
  sources: AnalyticsBreakdownRow[];
  countries: AnalyticsBreakdownRow[];
}

export interface AnalyticsNotConfigured {
  configured: false;
  missing: string[];
}

export interface AnalyticsError {
  configured: true;
  error: string;
}

export type AnalyticsResponse =
  | AnalyticsData
  | AnalyticsNotConfigured
  | AnalyticsError;
