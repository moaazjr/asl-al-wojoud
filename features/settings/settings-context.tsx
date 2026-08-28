"use client";

import * as React from "react";
import type { SiteSettings } from "@/interfaces/types";

const STORAGE_KEY = "aa:settings";

const DEFAULTS: SiteSettings = {
  commentsEnabled: true,
  lockedSections: [],
};

function load(): SiteSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<SiteSettings>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

function save(settings: SiteSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
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
  const loaded = React.useRef(false);

  React.useEffect(() => {
    if (!loaded.current) {
      loaded.current = true;
      setSettings(load());
    }
  }, []);

  React.useEffect(() => {
    if (loaded.current) save(settings);
  }, [settings]);

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setSettings(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setCommentsEnabled = React.useCallback((enabled: boolean) => {
    setSettings((prev) => ({ ...prev, commentsEnabled: enabled }));
  }, []);

  const lockSection = React.useCallback((sectionId: string) => {
    setSettings((prev) => ({
      ...prev,
      lockedSections: prev.lockedSections.includes(sectionId)
        ? prev.lockedSections
        : [...prev.lockedSections, sectionId],
    }));
  }, []);

  const unlockSection = React.useCallback((sectionId: string) => {
    setSettings((prev) => ({
      ...prev,
      lockedSections: prev.lockedSections.filter((id) => id !== sectionId),
    }));
  }, []);

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
