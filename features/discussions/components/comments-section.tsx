"use client";

import * as React from "react";
import { Loader2, Inbox, MessageSquareText } from "lucide-react";
import type { Discussion, DiscussionStatus, Role } from "@/interfaces/types";
import type { SectionDiscussionsApi } from "../use-section-discussions";
import { DiscussionThread } from "./discussion-thread";
import { CommentComposer } from "./comment-composer";

type FilterKey = "all" | "open" | "resolved";

const PAGE_SIZE = 10;

export function CommentsSection({
  api,
}: {
  api: SectionDiscussionsApi;
}) {
  const { discussions, loading, user } = api;
  const [filter, setFilter] = React.useState<FilterKey>("all");
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE);

  function changeFilter(next: FilterKey) {
    setFilter(next);
    setVisibleCount(PAGE_SIZE);
  }

  const counts = {
    all: discussions.length,
    open: discussions.filter((d) => d.status === "open").length,
    resolved: discussions.filter((d) => d.status === "resolved").length,
  };

  const visible: Discussion[] =
    filter === "all"
      ? discussions
      : discussions.filter((d) => d.status === (filter as DiscussionStatus));

  const shown = visible.slice(0, visibleCount);
  const hasMore = visible.length > visibleCount;

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "الكل", count: counts.all },
    { key: "open", label: "مفتوح", count: counts.open },
    { key: "resolved", label: "مُغلَق", count: counts.resolved },
  ];

  return (
    <section className="mt-10 border-t border-line pt-6">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="flex items-center gap-1.5 font-kufi text-lg font-bold text-ink">
          <MessageSquareText className="h-4.5 w-4.5 text-accent" />
          التعليقات
        </h2>
        {counts.all > 0 && (
          <span className="rounded-full bg-accent-soft px-2 py-0.5 font-kufi text-xs font-semibold text-accent">
            {counts.all}
          </span>
        )}
      </div>

      <div className="mb-4">
        <CommentComposer api={api} />
      </div>

      {counts.all > 1 && (
        <div className="mb-4 flex items-center gap-1 border-b border-line-soft pb-px">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => changeFilter(tab.key)}
              className={`relative px-3 py-2 font-kufi text-xs font-semibold transition-colors ${
                filter === tab.key
                  ? "text-accent"
                  : "text-ink-faint hover:text-ink"
              }`}
            >
              {tab.label}
              <span className="ms-1 text-[0.65rem] opacity-70">
                {tab.count}
              </span>
              {filter === tab.key && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />
              )}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
        </div>
      ) : shown.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center">
          <Inbox className="h-7 w-7 text-ink-faint/50" />
          <p className="font-kufi text-sm text-ink-faint">
            {user
              ? "لا توجد تعليقات بعد — كن أول من يعلّق على هذا المبحث"
              : "لا توجد تعليقات بعد — سجّل الدخول وابدأ بإضافة تعليق"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {shown.map((d) => (
            <DiscussionThread
              key={d.id}
              discussion={d}
              role={(user?.role ?? null) as Role | null}
              currentUserId={user?.id ?? null}
              api={api}
            />
          ))}
          {hasMore && (
            <div className="flex justify-center pt-1">
              <button
                type="button"
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                className="rounded-full border border-line bg-card px-5 py-2 font-kufi text-xs font-semibold text-ink-soft transition-colors hover:border-accent/40 hover:text-accent"
              >
                تحميل المزيد من التعليقات
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}