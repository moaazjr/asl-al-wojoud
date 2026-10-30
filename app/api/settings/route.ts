import { NextRequest } from "next/server";
import {
  json,
  errorResponse,
  requireAdmin,
} from "@/lib/api-helpers";
import {
  getSiteSettings,
  saveSiteSettings,
  validateSettingsPatch,
} from "@/lib/settings";

export async function GET() {
  return json(await getSiteSettings());
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return errorResponse("غير مصرّح", 403);

  const body = await req.json().catch(() => ({}));
  const patch = validateSettingsPatch(body as Record<string, unknown>);
  if (!patch) return errorResponse("بيانات الإعدادات غير صالحة.", 400);

  return json(await saveSiteSettings(patch));
}
