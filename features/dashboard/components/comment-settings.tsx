"use client";

import * as React from "react";
import { Settings, MessageSquareOff, Lock, Unlock } from "lucide-react";
import { useSettings } from "@/features/settings/settings-context";
import { useAuth } from "@/features/auth/use-auth";
import { permissions } from "@/services/permissions";

export function CommentSettings() {
  const { settings, setCommentsEnabled, lockSection, unlockSection } =
    useSettings();
  const { user } = useAuth();

  const [manualSectionId, setManualSectionId] = React.useState("");

  if (!user || !permissions.canManageSettings(user.role)) return null;

  const lockedIds = settings.lockedSections;

  function handleLockManual() {
    const id = manualSectionId.trim();
    if (id) {
      lockSection(id);
      setManualSectionId("");
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-soft">
      <div className="mb-4 flex items-center gap-2">
        <Settings className="h-4 w-4 text-accent" />
        <h2 className="font-kufi text-sm font-semibold text-ink">
          إعدادات التعليقات
        </h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareOff className="h-4 w-4 text-ink-faint" />
            <div>
              <p className="font-kufi text-sm font-semibold text-ink">
                تعطيل التعليقات
              </p>
              <p className="font-kufi text-xs text-ink-faint">
                منع جميع المستخدمين من إضافة تعليقات جديدة
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.commentsEnabled}
            onClick={() => setCommentsEnabled(!settings.commentsEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
              settings.commentsEnabled ? "bg-accent" : "bg-ink-faint/30"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                settings.commentsEnabled ? "translate-x-1" : "-translate-x-4"
              }`}
            />
          </button>
        </div>

        <div className="border-t border-line-soft pt-4">
          <div className="mb-3 flex items-center gap-2">
            <Lock className="h-4 w-4 text-ink-faint" />
            <p className="font-kufi text-sm font-semibold text-ink">
              قفل أقسام محددة
            </p>
          </div>

          <div className="mb-3 flex items-center gap-2">
            <div className="flex-1">
              <input
                value={manualSectionId}
                onChange={(e) => setManualSectionId(e.target.value)}
                placeholder="مثال: 1/slug"
                className="w-full rounded-lg border border-line-soft bg-paper-deep/50 px-3 py-1.5 font-naskh text-sm text-ink outline-none placeholder:text-ink-faint focus:border-accent/40"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLockManual();
                }}
              />
            </div>
            <button
              type="button"
              disabled={!manualSectionId.trim()}
              onClick={handleLockManual}
              className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 font-kufi text-xs font-bold text-paper transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              <Lock className="h-3 w-3" />
              قفل
            </button>
          </div>

          {lockedIds.length > 0 && (
            <div className="space-y-1.5">
              {lockedIds.map((id) => (
                <div
                  key={id}
                  className="flex items-center justify-between rounded-lg bg-paper-deep/50 px-3 py-1.5"
                >
                  <span className="font-naskh text-xs text-ink-soft" dir="ltr">
                    {id}
                  </span>
                  <button
                    type="button"
                    onClick={() => unlockSection(id)}
                    className="inline-flex items-center gap-1 font-kufi text-xs text-rose-600 transition-colors hover:text-rose-700 dark:text-rose-400"
                  >
                    <Unlock className="h-3 w-3" />
                    فتح
                  </button>
                </div>
              ))}
            </div>
          )}

          {lockedIds.length === 0 && (
            <p className="font-kufi text-xs text-ink-faint">
              لا توجد أقسام مقفلة
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
