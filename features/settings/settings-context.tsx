"use client";

import * as React from "react";
import type { SiteSettings } from "@/interfaces/types";

const DEFAULTS: SiteSettings = {
  commentsEnabled: true,
  lockedSections: [],
};

async function requestSettings(
  init?: RequestInit,
): Promise<SiteSettings> {
  const res = await fetch("/api/settings", {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error("تعذّر تحديث الإعدادات.");
  return (await res.json()) as SiteSettings;
}

interface SettingsCtx {
  settings: SiteSettings;
  setCommentsEnabled: (enabled: boolean) => void;
  lockSection: (sectionId: string) => void;
  unlockSection: (sectionId: string) => void;
  isSectionLocked: (sectionId: string) => boolean;
}

const Ctx = React.createContext<SettingsCtx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<SiteSettings>(DEFAULTS);

  const refresh = React.useCallback(async () => {
    try {
      setSettings(await requestSettings());
    } catch {
      setSettings(DEFAULTS);
    }
  }, []);

  React.useEffect(() => {
    const run = async () => {
      await refresh();
    };
    void run();
  }, [refresh]);

  const commit = React.useCallback(
    async (patch: Partial<SiteSettings>, optimistic: SiteSettings) => {
      setSettings(optimistic);
      try {
        setSettings(
          await requestSettings({
            method: "PATCH",
            body: JSON.stringify(patch),
          }),
        );
      } catch {
        void refresh();
      }
    },
    [refresh],
  );

  const setCommentsEnabled = React.useCallback(
    (enabled: boolean) => {
      void commit(
        { commentsEnabled: enabled },
        { ...settings, commentsEnabled: enabled },
      );
    },
    [commit, settings],
  );

  const lockSection = React.useCallback(
    (sectionId: string) => {
      const id = sectionId.trim();
      if (!id || settings.lockedSections.includes(id)) return;
      const lockedSections = [...settings.lockedSections, id];
      void commit({ lockedSections }, { ...settings, lockedSections });
    },
    [commit, settings],
  );

  const unlockSection = React.useCallback(
    (sectionId: string) => {
      const lockedSections = settings.lockedSections.filter(
        (id) => id !== sectionId,
      );
      void commit({ lockedSections }, { ...settings, lockedSections });
    },
    [commit, settings],
  );

  const isSectionLocked = React.useCallback(
    (sectionId: string) => settings.lockedSections.includes(sectionId),
    [settings.lockedSections],
  );

  const value = React.useMemo<SettingsCtx>(
    () => ({
      settings,
      setCommentsEnabled,
      lockSection,
      unlockSection,
      isSectionLocked,
    }),
    [settings, setCommentsEnabled, lockSection, unlockSection, isSectionLocked],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings(): SettingsCtx {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useSettings must be inside SettingsProvider");
  return ctx;
}
