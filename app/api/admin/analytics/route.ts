import type { NextRequest } from "next/server";
import { errorResponse, json, requireAdmin } from "@/lib/api-helpers";
import {
  fetchAnalytics,
  isGa4Configured,
  missingGa4Env,
} from "@/lib/ga4";
import { isAnalyticsRange } from "@/interfaces/analytics";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return errorResponse("لا تملك صلاحية الوصول إلى التحليلات.", 403);
  }

  if (!isGa4Configured()) {
    return json({ configured: false, missing: [...missingGa4Env()] });
  }

  const rangeParam = Number(request.nextUrl.searchParams.get("range"));
  const range = isAnalyticsRange(rangeParam) ? rangeParam : 30;

  try {
    const data = await fetchAnalytics(range);
    return json(data);
  } catch {
    return errorResponse("تعذّر جلب بيانات التحليلات من Google Analytics.", 502);
  }
}
