"use client";

import * as React from "react";
import { Loader2, Inbox } from "lucide-react";
import type { Discussion, DiscussionStatus, Role } from "@/interfaces/types";
import type { SectionDiscussionsApi } from "../use-section-discussions";
import { DiscussionThread } from "./discussion-thread";

type FilterKey = "all" | "open" | "resolved";

export function DiscussionPanel({
  api,
}: {
  api: SectionDiscussionsApi;
}) {
  const { discussions, loading, user } = api;
  const [filter, setFilter] = React.useState<FilterKey>("all");

  const threads = discussions.filter((d) => d.kind === "discussion");

  const counts = {
    all: threads.length,
    open: threads.filter((d) => d.status === "open").length,
    resolved: threads.filter((d) => d.status === "resolved").length,
  };

  const visible: Discussion[] =
    filter === "all"
      ? threads
      : threads.filter((d) => d.status === (filter as DiscussionStatus));

  const filterTabs: { key: FilterKey; label: string; count: number }[] = [
    { key: "all", label: "الكل", count: counts.all },
    { key: "open", label: "مفتوح", count: counts.open },
    { key: "resolved", label: "مُغلَق", count: counts.resolved },
  ];

  return (
    <section className="mt-10 border-t border-line pt-6">
      <div className="mb-3 flex items-center gap-2">
        <h2 className="font-kufi text-base font-bold text-ink">
          التعليقات
        </h2>
        {counts.all > 0 && (
          <span className="font-kufi text-sm text-ink-faint">
            {counts.all}
          </span>
        )}
      </div>

      {counts.all > 1 && (
        <div className="mb-4 flex items-center gap-1 border-b border-line-soft pb-px">
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
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
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <Inbox className="h-7 w-7 text-ink-faint/50" />
          <p className="font-kufi text-sm text-ink-faint">
            {user
              ? "حدّد نصًا من المقال لبدء نقاش"
              : "لا توجد تعليقات بعد — سجّل الدخول وابدأ النقاش"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((d) => (
            <DiscussionThread
              key={d.id}
              discussion={d}
              role={(user?.role ?? null) as Role | null}
              currentUserId={user?.id ?? null}
              api={api}
            />
          ))}
        </div>
      )}
    </section>
  );
}
