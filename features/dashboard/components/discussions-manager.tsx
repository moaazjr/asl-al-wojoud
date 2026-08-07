"use client";

import * as React from "react";
import {
  Search,
  CheckCircle2,
  CircleDot,
  RotateCcw,
  Trash2,
  MessageSquareText,
  Inbox,
} from "lucide-react";
import type { Discussion, DiscussionStatus } from "@/interfaces/types";
import { useDashboard } from "../use-dashboard";
import { formatRelativeTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardThreadDialog } from "./dashboard-thread-dialog";

function lastActivity(d: Discussion): number {
  return d.messages[d.messages.length - 1]?.createdAt ?? d.createdAt;
}

export function DiscussionsManager({
  lockFilter,
}: {
  lockFilter?: DiscussionStatus;
}) {
  const { discussions, selected, toggleSelected, setSelected, resolveMany, reopen, deleteMany, reload } =
    useDashboard();
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<"all" | DiscussionStatus>(
    lockFilter ?? "all",
  );
  const [active, setActive] = React.useState<Discussion | null>(null);
  const [open, setOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return discussions.filter((d) => {
      if (lockFilter && d.status !== lockFilter) return false;
      if (!lockFilter && tab !== "all" && d.status !== tab) return false;
      if (!q) return true;
      return (
        d.sectionTitle.toLowerCase().includes(q) ||
        d.messages.some(
          (m) =>
            m.text.toLowerCase().includes(q) ||
            m.authorName.toLowerCase().includes(q),
        )
      );
    });
  }, [discussions, query, tab, lockFilter]);

  const selectedIds = React.useMemo(
    () => Array.from(selected).filter((id) => discussions.some((d) => d.id === id)),
    [selected, discussions],
  );

  function openThread(d: Discussion) {
    setActive(d);
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-ink-faint" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في التعليقات…"
            className="ps-9"
          />
        </div>
        {!lockFilter && (
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="open">مفتوح</TabsTrigger>
              <TabsTrigger value="resolved">مُغلَق</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/30 bg-accent-soft/40 px-3 py-2">
          <span className="font-kufi text-sm text-ink-soft">
            {selectedIds.length} محدّد
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => void resolveMany(selectedIds)}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            إغلاق المحدّد
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-rose-600 dark:text-rose-400"
            onClick={() => {
              if (confirm(`حذف ${selectedIds.length} تعليق؟`))
                void deleteMany(selectedIds);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            حذف المحدّد
          </Button>
          <button
            onClick={() => setSelected(new Set())}
            className="ms-auto font-kufi text-xs text-ink-faint hover:text-ink"
          >
            إلغاء التحديد
          </button>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-12 text-center">
          <Inbox className="h-6 w-6 text-ink-faint" />
          <p className="font-kufi text-sm text-ink-faint">لا توجد تعليقات</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          {filtered.map((d, i) => (
            <div
              key={d.id}
              className={`flex items-start gap-3 p-3 ${
                i > 0 ? "border-t border-line-soft" : ""
              }`}
            >
              <span className="pt-1">
                <Checkbox
                  checked={selected.has(d.id)}
                  onChange={() => toggleSelected(d.id)}
                />
              </span>

              <button
                onClick={() => openThread(d)}
                className="min-w-0 flex-1 text-start"
              >
                <div className="flex items-center gap-2">
                  {d.status === "resolved" ? (
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      مُغلَق
                    </Badge>
                  ) : (
                    <Badge variant="warning" className="gap-1">
                      <CircleDot className="h-3 w-3" />
                      مفتوح
                    </Badge>
                  )}
                  {d.hasAdminReply && <Badge variant="default">ردّ مشرف</Badge>}
                  <span className="ms-auto font-kufi text-xs text-ink-faint">
                    {formatRelativeTime(lastActivity(d))}
                  </span>
                </div>
                <p className="mt-1.5 line-clamp-2 font-naskh text-sm leading-relaxed text-ink-soft">
                  {d.messages[0]?.text ?? "…"}
                </p>
                <div className="mt-1.5 flex items-center gap-3 font-kufi text-xs text-ink-faint">
                  <span className="inline-flex items-center gap-1">
                    <MessageSquareText className="h-3 w-3" />
                    {d.messages.length}
                  </span>
                  <span className="truncate">{d.sectionTitle}</span>
                </div>
              </button>

              <div className="flex shrink-0 flex-col gap-1">
                {d.status === "open" && (
                  <button
                    title="إغلاق"
                    onClick={() => void resolveMany([d.id])}
                    className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-paper-deep hover:text-emerald-600"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                )}
                {d.status === "resolved" && (
                  <button
                    title="إعادة الفتح"
                    onClick={() => void reopen(d.id)}
                    className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-paper-deep hover:text-amber-600"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
                <button
                  title="حذف"
                  onClick={() => {
                    if (confirm("حذف هذا التعليق؟")) void deleteMany([d.id]);
                  }}
                  className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-paper-deep hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DashboardThreadDialog
        discussion={active}
        open={open}
        onOpenChange={setOpen}
        onChanged={reload}
      />
    </div>
  );
}
