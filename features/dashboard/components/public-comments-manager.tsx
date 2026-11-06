"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  CornerDownLeft,
  ExternalLink,
  Loader2,
  MessageSquareText,
  Pencil,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import type {
  PublicComment,
  PublicCommentCounts,
  PublicCommentFilter,
} from "@/interfaces/types";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import {
  deletePublicComment,
  listPublicComments,
  moderatePublicComment,
  removePublicCommentReply,
  replyToPublicComment,
  type ModerationAction,
} from "@/features/comments/api";
import { notifyPublicCommentsChanged } from "../use-pending-comments";

const PAGE_SIZE = 20;
const MAX_REPLY = 2000;

const EMPTY_COUNTS: PublicCommentCounts = {
  pending: 0,
  approved: 0,
  rejected: 0,
  total: 0,
};

const TABS: { key: PublicCommentFilter; label: string; count: keyof PublicCommentCounts }[] = [
  { key: "pending", label: "بانتظار المراجعة", count: "pending" },
  { key: "approved", label: "معتمدة", count: "approved" },
  { key: "rejected", label: "مرفوضة", count: "rejected" },
  { key: "all", label: "الكل", count: "total" },
];

const ACTION_NOTICE: Record<ModerationAction, string> = {
  approve: "تمت الموافقة على التعليق، وأصبح ظاهرًا في صفحة المبحث.",
  reject: "تم رفض التعليق، ولن يظهر للزوّار.",
  pending: "أُعيد التعليق إلى قائمة المراجعة، ولم يعد ظاهرًا للزوّار.",
};

const absoluteDate = (ts: number) =>
  new Date(ts).toLocaleString("ar", { dateStyle: "medium", timeStyle: "short" });

export function PublicCommentsManager() {
  const [tab, setTab] = React.useState<PublicCommentFilter>("pending");
  const [query, setQuery] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [reloadKey, setReloadKey] = React.useState(0);

  const [items, setItems] = React.useState<PublicComment[]>([]);
  const [total, setTotal] = React.useState(0);
  const [counts, setCounts] = React.useState<PublicCommentCounts>(EMPTY_COUNTS);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  React.useEffect(() => {
    let cancelled = false;
    listPublicComments({ status: tab, q: search, page, pageSize: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setItems(res.items);
        setTotal(res.total);
        setCounts(res.counts);
        setLoadError(null);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setLoadError(
          err instanceof Error && err.message === "غير مصرّح"
            ? "انتهت جلسة المشرف أو لا تملك صلاحية. سجّل الدخول من جديد ثم أعد المحاولة."
            : "تعذّر تحميل التعليقات. تحقّق من الاتصال ثم أعد المحاولة.",
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, search, page, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const refresh = React.useCallback(() => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  function changeTab(next: PublicCommentFilter) {
    if (next === tab) return;
    setTab(next);
    setPage(1);
    setLoading(true);
    setNotice(null);
  }

  function changePage(next: number) {
    setPage(next);
    setLoading(true);
  }

  async function run(id: string, task: () => Promise<unknown>, success: string, failure: string) {
    setBusyId(id);
    setNotice(null);
    setActionError(null);
    try {
      await task();
      setNotice(success);
      notifyPublicCommentsChanged();
      if (items.length === 1 && page > 1) setPage(page - 1);
      refresh();
      return true;
    } catch (err) {
      setActionError(
        err instanceof Error && err.message.trim() ? `${failure} (${err.message})` : failure,
      );
      return false;
    } finally {
      setBusyId(null);
    }
  }

  const moderate = (id: string, action: ModerationAction) =>
    run(id, () => moderatePublicComment(id, action), ACTION_NOTICE[action], "تعذّر تنفيذ الإجراء.");

  const remove = (id: string) => {
    if (!confirm("هل تريد حذف هذا التعليق نهائيًا؟ لا يمكن التراجع عن هذا الإجراء.")) return;
    void run(id, () => deletePublicComment(id), "تم حذف التعليق نهائيًا.", "تعذّر حذف التعليق.");
  };

  const reply = (id: string, text: string) =>
    run(id, () => replyToPublicComment(id, text), "تم حفظ ردّ المشرف.", "تعذّر حفظ الردّ.");

  const removeReply = (id: string) => {
    if (!confirm("هل تريد حذف ردّ المشرف؟")) return;
    void run(id, () => removePublicCommentReply(id), "تم حذف الردّ.", "تعذّر حذف الردّ.");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-card p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => changeTab(t.key)}
              aria-pressed={tab === t.key}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 font-kufi text-xs font-semibold transition-colors",
                tab === t.key
                  ? "bg-accent text-paper"
                  : "text-ink-soft hover:bg-paper-deep hover:text-ink",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-px text-[0.65rem]",
                  tab === t.key
                    ? "bg-paper/20"
                    : t.key === "pending" && counts.pending > 0
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      : "bg-paper-deep",
                )}
              >
                {counts[t.count].toLocaleString("en-US")}
              </span>
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-ink-faint" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث بالاسم أو نصّ التعليق أو الفصل…"
            className="ps-9"
            aria-label="بحث في التعليقات"
          />
        </div>
        <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
          <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          تحديث
        </Button>
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-lg border border-emerald-300/50 bg-emerald-500/5 px-3 py-2 font-kufi text-xs text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/5 dark:text-emerald-400"
        >
          {notice}
        </p>
      )}
      {(actionError || loadError) && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-lg border border-rose-300/50 bg-rose-500/5 px-3 py-2 font-kufi text-xs text-rose-600 dark:border-rose-400/30 dark:bg-rose-400/5 dark:text-rose-400"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {actionError ?? loadError}
        </p>
      )}

      {loading && items.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-2xl border border-line bg-paper-deep/40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        loadError ? null : (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-12 text-center">
            <MessageSquareText className="h-6 w-6 text-ink-faint" />
            <p className="font-kufi text-sm text-ink-faint">
              {search
                ? "لا توجد نتائج مطابقة للبحث."
                : tab === "pending"
                  ? "لا توجد تعليقات بانتظار المراجعة."
                  : "لا توجد تعليقات في هذا التصنيف."}
            </p>
          </div>
        )
      ) : (
        <div
          className={cn(
            "overflow-hidden rounded-2xl border border-line bg-card transition-opacity",
            loading && "opacity-60",
          )}
          aria-busy={loading}
        >
          {items.map((c, i) => (
            <CommentRow
              key={c.id}
              comment={c}
              first={i === 0}
              busy={busyId === c.id}
              onModerate={moderate}
              onDelete={remove}
              onReply={reply}
              onRemoveReply={removeReply}
            />
          ))}
        </div>
      )}

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-3">
          <p className="font-kufi text-xs text-ink-faint">
            صفحة {page.toLocaleString("en-US")} من {totalPages.toLocaleString("en-US")} ·{" "}
            {total.toLocaleString("en-US")} تعليق
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => changePage(page - 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => changePage(page + 1)}
            >
              التالي
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: PublicComment["status"] }) {
  if (status === "pending")
    return (
      <Badge variant="warning" className="gap-1">
        <Clock className="h-3 w-3" />
        بانتظار المراجعة
      </Badge>
    );
  if (status === "approved")
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        معتمد
      </Badge>
    );
  return (
    <Badge variant="outline" className="gap-1">
      <XCircle className="h-3 w-3" />
      مرفوض
    </Badge>
  );
}

function CommentRow({
  comment: c,
  first,
  busy,
  onModerate,
  onDelete,
  onReply,
  onRemoveReply,
}: {
  comment: PublicComment;
  first: boolean;
  busy: boolean;
  onModerate: (id: string, action: ModerationAction) => Promise<boolean>;
  onDelete: (id: string) => void;
  onReply: (id: string, text: string) => Promise<boolean>;
  onRemoveReply: (id: string) => void;
}) {
  const [replying, setReplying] = React.useState(false);
  const [draft, setDraft] = React.useState(c.adminReply ?? "");

  function openReply() {
    setDraft(c.adminReply ?? "");
    setReplying(true);
  }

  async function submitReply() {
    const text = draft.trim();
    if (!text) return;
    const ok = await onReply(c.id, text);
    if (ok) setReplying(false);
  }

  return (
    <article className={cn("flex flex-col gap-3 p-4", !first && "border-t border-line-soft")}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={c.status} />
        <span className="font-kufi text-sm font-semibold text-ink">{c.name}</span>
        {c.email && (
          <a
            href={`mailto:${c.email}`}
            dir="ltr"
            className="font-kufi text-xs text-ink-faint hover:text-accent"
          >
            {c.email}
          </a>
        )}
        <time
          dateTime={new Date(c.createdAt).toISOString()}
          title={absoluteDate(c.createdAt)}
          className="ms-auto font-kufi text-xs text-ink-faint"
        >
          {formatRelativeTime(c.createdAt)}
        </time>
      </div>

      <Link
        href={`/${c.sectionId}#section-comments`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-fit items-center gap-1.5 rounded-md bg-paper-deep/60 px-2 py-1 font-kufi text-xs text-ink-soft hover:text-accent"
      >
        <ExternalLink className="h-3 w-3" />
        {c.bookTitle || "—"} · {c.sectionTitle || c.sectionId}
      </Link>

      <p className="whitespace-pre-wrap break-words font-naskh text-sm leading-relaxed text-ink">
        {c.text}
      </p>

      {c.adminReply && !replying && (
        <div className="ms-4 rounded-xl border-s-2 border-accent bg-accent-soft/40 px-3 py-2">
          <div className="flex items-center gap-2">
            <Badge variant="admin" className="text-[0.6rem]">ردّ المشرف</Badge>
            {c.adminReplyAt && (
              <span className="font-kufi text-[0.65rem] text-ink-faint">
                {formatRelativeTime(c.adminReplyAt)}
              </span>
            )}
            <div className="ms-auto flex gap-1">
              <button
                type="button"
                onClick={openReply}
                disabled={busy}
                className="rounded p-1 text-ink-faint hover:text-ink"
                aria-label="تعديل الردّ"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onRemoveReply(c.id)}
                disabled={busy}
                className="rounded p-1 text-ink-faint hover:text-rose-600"
                aria-label="حذف الردّ"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <p className="mt-1 whitespace-pre-wrap break-words font-naskh text-sm leading-relaxed text-ink-soft">
            {c.adminReply}
          </p>
        </div>
      )}

      {replying && (
        <div className="space-y-2">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={MAX_REPLY}
            rows={3}
            autoFocus
            placeholder="اكتب ردّ المشرف…"
            aria-label="ردّ المشرف"
          />
          {c.status !== "approved" && (
            <p className="font-kufi text-[0.7rem] text-ink-faint">
              سيظهر الردّ للزوّار فقط بعد الموافقة على التعليق.
            </p>
          )}
          <div className="flex gap-2">
            <Button size="sm" variant="default" onClick={() => void submitReply()} disabled={busy || !draft.trim()}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CornerDownLeft className="h-3.5 w-3.5" />}
              حفظ الردّ
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setReplying(false)} disabled={busy}>
              إلغاء
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {c.status !== "approved" && (
          <Button size="sm" variant="default" onClick={() => void onModerate(c.id, "approve")} disabled={busy}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            الموافقة
          </Button>
        )}
        {c.status !== "rejected" && (
          <Button
            size="sm"
            variant="outline"
            className="text-rose-600 dark:text-rose-400"
            onClick={() => void onModerate(c.id, "reject")}
            disabled={busy}
          >
            <XCircle className="h-3.5 w-3.5" />
            الرفض
          </Button>
        )}
        {c.status !== "pending" && (
          <Button size="sm" variant="ghost" onClick={() => void onModerate(c.id, "pending")} disabled={busy}>
            <RotateCcw className="h-3.5 w-3.5" />
            إعادة للمراجعة
          </Button>
        )}
        {!replying && !c.adminReply && (
          <Button size="sm" variant="outline" onClick={openReply} disabled={busy}>
            <CornerDownLeft className="h-3.5 w-3.5" />
            الردّ
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="ms-auto text-rose-600 dark:text-rose-400"
          onClick={() => onDelete(c.id)}
          disabled={busy}
        >
          <Trash2 className="h-3.5 w-3.5" />
          حذف
        </Button>
      </div>
    </article>
  );
}
