"use client";

import {
  Users,
  MessagesSquare,
  CircleDot,
  CheckCircle2,
  BookOpen,
  Trophy,
  Clock,
} from "lucide-react";
import { useDashboard } from "../use-dashboard";
import { formatRelativeTime } from "@/lib/format";
import { StatCard } from "./stat-card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

export function Overview() {
  const { stats, loading } = useDashboard();

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-2xl border border-line bg-paper-deep/40"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-kufi text-2xl font-bold text-ink">نظرة عامة</h1>
        <p className="font-kufi text-sm text-ink-faint">
          ملخّص نشاط التعليقات والمستخدمين
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="إجمالي المستخدمين"
          value={stats.totalUsers}
          icon={Users}
          tone="sky"
        />
        <StatCard
          label="إجمالي التعليقات"
          value={stats.totalMessages}
          icon={MessagesSquare}
        />
        <StatCard
          label="تعليقات مفتوحة"
          value={stats.openDiscussions}
          icon={CircleDot}
          tone="amber"
        />
        <StatCard
          label="تعليقات مغلقة"
          value={stats.resolvedDiscussions}
          icon={CheckCircle2}
          tone="emerald"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-4 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-accent" />
            <h2 className="font-kufi text-sm font-semibold text-ink">
              الباب الأكثر نقاشًا
            </h2>
          </div>
          {stats.mostCommentedChapter ? (
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <p className="font-kufi text-sm font-semibold text-ink">
                  {stats.mostCommentedChapter.bookTitle}
                </p>
                <p className="font-kufi text-xs text-ink-faint">
                  {stats.mostCommentedChapter.count} تعليق
                </p>
              </div>
            </div>
          ) : (
            <p className="font-kufi text-sm text-ink-faint">لا توجد بيانات بعد</p>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-card p-4 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent" />
            <h2 className="font-kufi text-sm font-semibold text-ink">
              النشاط الأخير
            </h2>
          </div>
          {stats.recentMessages.length === 0 ? (
            <p className="font-kufi text-sm text-ink-faint">لا نشاط حديث</p>
          ) : (
            <ul className="space-y-2.5">
              {stats.recentMessages.slice(0, 5).map((m) => (
                <li key={m.id} className="flex items-start gap-2.5">
                  <Avatar
                    name={m.authorName}
                    isAdmin={m.authorRole === "admin"}
                    className="h-7 w-7 text-[0.7rem]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-kufi text-xs font-semibold text-ink">
                        {m.authorName}
                      </span>
                      {m.authorRole === "admin" && (
                        <Badge variant="admin" className="text-[0.6rem]">
                          مشرف
                        </Badge>
                      )}
                      <span className="ms-auto font-kufi text-[0.65rem] text-ink-faint">
                        {formatRelativeTime(m.createdAt)}
                      </span>
                    </div>
                    <p className="line-clamp-1 font-naskh text-xs text-ink-soft">
                      {m.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
