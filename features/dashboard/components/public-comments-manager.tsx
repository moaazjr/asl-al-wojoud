"use client";

import * as React from "react";
import {
  CheckCircle2,
  Clock,
  MessageSquareText,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import type { CommentModerationStatus, PublicComment } from "@/interfaces/types";
import { formatRelativeTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  deletePublicComment,
  listPublicComments,
  moderatePublicComment,
} from "@/features/comments/api";

export function PublicCommentsManager() {
  const [comments, setComments] = React.useState<PublicComment[]>([]);
  const [, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<"all" | CommentModerationStatus>("pending");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "all") {
        const pending = await listPublicComments("pending");
        const approved = await listPublicComments("approved");
        const rejected = await listPublicComments("rejected");
        const combined = [...pending, ...approved, ...rejected].sort(
          (a, b) => b.createdAt - a.createdAt,
        );
        setComments(combined);
      } else {
        const data = await listPublicComments(tab);
        setComments(data);
      }
    } finally {
      setLoading(false);
    }
  }, [tab]);

  React.useEffect(() => {
    let active = true;
    const run = async () => {
      if (active) await load();
    };
    run();
    return () => {
      active = false;
    };
  }, [load]);

  async function handleApprove(id: string) {
    setBusyId(id);
    try {
      await moderatePublicComment(id, "approve");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(id: string) {
    setBusyId(id);
    try {
      await moderatePublicComment(id, "reject");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل تريد حذف هذا التعليق نهائيًا؟")) return;
    setBusyId(id);
    try {
      await deletePublicComment(id);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return comments;
    return comments.filter((c) => {
      return (
        c.name.toLowerCase().includes(q) ||
        c.text.toLowerCase().includes(q) ||
        c.sectionTitle.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q)
      );
    });
  }, [comments, query]);

  const pendingCount = React.useMemo(
    () => comments.filter((c) => c.status === "pending").length,
    [comments],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-ink-faint" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في تعليقات الزوار…"
            className="ps-9"
          />
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="pending">
              بانتظار الموافقة
              {pendingCount > 0 && <span className="ms-1 opacity-70">({pendingCount})</span>}
            </TabsTrigger>
            <TabsTrigger value="approved">معتمد</TabsTrigger>
            <TabsTrigger value="rejected">مرفوض</TabsTrigger>
            <TabsTrigger value="all">الكل</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-12 text-center">
          <MessageSquareText className="h-6 w-6 text-ink-faint" />
          <p className="font-kufi text-sm text-ink-faint">لا توجد تعليقات</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          {filtered.map((c, i) => (
            <article
              key={c.id}
              className={`flex flex-col gap-3 p-4 ${
                i > 0 ? "border-t border-line-soft" : ""
              }`}
            >
              <div className="flex flex-wrap items-start gap-2">
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    {c.status === "pending" && (
                      <Badge variant="warning" className="gap-1">
                        <Clock className="h-3 w-3" />
                        بانتظار الموافقة
                      </Badge>
                    )}
                    {c.status === "approved" && (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        معتمد
                      </Badge>
                    )}
                    {c.status === "rejected" && (
                      <Badge variant="outline" className="gap-1">
                        <XCircle className="h-3 w-3" />
                        مرفوض
                      </Badge>
                    )}
                    <span className="ms-auto font-kufi text-xs text-ink-faint">
                      {formatRelativeTime(c.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 font-kufi text-sm font-semibold text-ink">
                    {c.name}
                    {c.email && (
                      <span className="ms-1 font-normal text-ink-faint">
                        ({c.email})
                      </span>
                    )}
                  </p>
                  <p className="mt-1 font-kufi text-xs text-ink-faint">
                    المبحث: {c.bookTitle} — {c.sectionTitle}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap break-words font-naskh text-sm leading-relaxed text-ink-soft">
                    {c.text}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {c.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(c.id)}
                      disabled={busyId === c.id}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      الموافقة
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-rose-600 dark:text-rose-400"
                      onClick={() => handleReject(c.id)}
                      disabled={busyId === c.id}
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      الرفض
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600 dark:text-rose-400"
                  onClick={() => handleDelete(c.id)}
                  disabled={busyId === c.id}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف
                </Button>
                <a
                  href={`/${c.sectionId}#section-comments`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ms-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-kufi text-xs text-ink-faint hover:text-ink"
                >
                  فتح المبحث
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
