import type { NextRequest } from "next/server";
import { errorResponse, requireAdmin } from "@/lib/api-helpers";
import { prisma } from "@/lib/prisma";
import { fetchGa4 } from "@/lib/ga4";
import {
  isoDateInZone,
  resolvePeriod,
  shiftIsoDate,
  startOfDayInZone,
  type AnalyticsPeriod,
  type AnalyticsResponse,
  type CommentStats,
} from "@/interfaces/analytics";

export const dynamic = "force-dynamic";

async function loadCommentStats(period: AnalyticsPeriod): Promise<CommentStats> {
  const from = startOfDayInZone(period.startDate);
  const to = startOfDayInZone(shiftIsoDate(period.endDate, 1));

  const [grouped, inPeriod] = await Promise.all([
    prisma.publicComment.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.publicComment.findMany({
      where: { createdAt: { gte: from, lt: to } },
      select: { createdAt: true },
    }),
  ]);

  const stats: CommentStats = {
    submittedInPeriod: inPeriod.length,
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
    daily: [],
  };
  for (const row of grouped) {
    const n = row._count._all;
    if (row.status === "PENDING") stats.pending = n;
    if (row.status === "APPROVED") stats.approved = n;
    if (row.status === "REJECTED") stats.rejected = n;
    stats.total += n;
  }

  const byDay = new Map<string, number>();
  for (let d = period.startDate; d <= period.endDate; d = shiftIsoDate(d, 1)) {
    byDay.set(d, 0);
  }
  for (const { createdAt } of inPeriod) {
    const key = isoDateInZone(createdAt);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  stats.daily = Array.from(byDay, ([date, value]) => ({ date, value }));
  return stats;
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse("لا تملك صلاحية الوصول إلى التحليلات.", 403);
  }

  const params = request.nextUrl.searchParams;
  const period = resolvePeriod(params.get("range"), params.get("start"), params.get("end"));
  if ("error" in period) return errorResponse(period.error, 400);

  const fresh = params.get("fresh") === "1";

  const [ga4, comments] = await Promise.all([
    fetchGa4(period, { fresh }).catch((err: unknown) => {
      console.error("[analytics] GA4 failed", err);
      return { state: "error", message: "تعذّر جلب بيانات Google Analytics." } as const;
    }),
    loadCommentStats(period).then(
      (value) => ({ value }),
      (err: unknown) => {
        console.error("[analytics] comment stats failed", err);
        return { value: null };
      },
    ),
  ]);

  const body: AnalyticsResponse = {
    period,
    generatedAt: new Date().toISOString(),
    ga4,
    comments: comments.value,
    ...(comments.value ? {} : { commentsError: "تعذّر تحميل إحصاءات التعليقات من قاعدة البيانات." }),
  };

  return Response.json(body, { headers: { "Cache-Control": "no-store" } });
}
