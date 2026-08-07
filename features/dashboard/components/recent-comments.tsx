"use client";

import { Clock, Inbox } from "lucide-react";
import { useDashboard } from "../use-dashboard";
import { formatRelativeTime, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

export function RecentComments() {
  const { stats, loading } = useDashboard();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-kufi text-2xl font-bold text-ink">
          أحدث التعليقات
        </h1>
        <p className="font-kufi text-sm text-ink-faint">
          آخر الرسائل عبر كل التعليقات
        </p>
      </div>

      {loading || !stats ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 animate-pulse rounded-2xl border border-line bg-paper-deep/40"
            />
          ))}
        </div>
      ) : stats.recentMessages.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-12 text-center">
          <Inbox className="h-6 w-6 text-ink-faint" />
          <p className="font-kufi text-sm text-ink-faint">لا تعليقات بعد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {stats.recentMessages.map((m) => (
            <div
              key={m.id}
              className="flex items-start gap-3 rounded-2xl border border-line bg-card p-3.5"
            >
              <Avatar
                name={m.authorName}
                isAdmin={m.authorRole === "admin"}
                className="h-9 w-9"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-kufi text-sm font-semibold text-ink">
                    {m.authorName}
                  </span>
                  {m.authorRole === "admin" && (
                    <Badge variant="admin" className="text-[0.6rem]">
                      مشرف
                    </Badge>
                  )}
                  <span className="ms-auto inline-flex items-center gap-1 font-kufi text-[0.7rem] text-ink-faint">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(m.createdAt)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 font-naskh text-sm leading-relaxed text-ink-soft">
                  {m.text}
                </p>
                <p className="mt-1 font-kufi text-[0.65rem] text-ink-faint">
                  {formatDate(m.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
