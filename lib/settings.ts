import "server-only";
import type { SiteSettings } from "@/interfaces/types";
import { prisma } from "@/lib/prisma";

const SETTINGS_ID = "singleton";

export const DEFAULT_SETTINGS: SiteSettings = {
  commentsEnabled: true,
  lockedSections: [],
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await prisma.siteSetting.findUnique({
    where: { id: SETTINGS_ID },
  });
  if (!row) return DEFAULT_SETTINGS;
  return {
    commentsEnabled: row.commentsEnabled,
    lockedSections: row.lockedSections,
  };
}

export async function saveSiteSettings(
  patch: Partial<SiteSettings>,
): Promise<SiteSettings> {
  const current = await getSiteSettings();
  const next: SiteSettings = {
    commentsEnabled: patch.commentsEnabled ?? current.commentsEnabled,
    lockedSections: patch.lockedSections ?? current.lockedSections,
  };

  const row = await prisma.siteSetting.upsert({
    where: { id: SETTINGS_ID },
    update: next,
    create: { id: SETTINGS_ID, ...next },
  });

  return {
    commentsEnabled: row.commentsEnabled,
    lockedSections: row.lockedSections,
  };
}

export function validateSettingsPatch(
  body: Record<string, unknown>,
): Partial<SiteSettings> | null {
  const patch: Partial<SiteSettings> = {};

  if (body.commentsEnabled !== undefined) {
    if (typeof body.commentsEnabled !== "boolean") return null;
    patch.commentsEnabled = body.commentsEnabled;
  }

  if (body.lockedSections !== undefined) {
    if (
      !Array.isArray(body.lockedSections) ||
      body.lockedSections.some((value) => typeof value !== "string")
    )
      return null;
    patch.lockedSections = Array.from(
      new Set(body.lockedSections.map((value) => value.trim()).filter(Boolean)),
    );
  }

  if (Object.keys(patch).length === 0) return null;
  return patch;
}
