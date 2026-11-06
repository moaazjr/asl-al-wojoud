"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  MessageSquareText,
  XCircle,
} from "lucide-react";
import type { PublicComment } from "@/interfaces/types";
import { formatRelativeTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  listPublicComments,
  moderatePublicComment,
} from "@/features/comments/api";
import { notifyPublicCommentsChanged } from "../use-pending-comments";

const PREVIEW_COUNT = 5;

export function PendingCommentsPanel() {
  const [comments, setComments] = React.useState<PublicComment[]>([]);
  const [pendingTotal, setPendingTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [reloadKey, setReloadKey] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    listPublicComments({ status: "pending", pageSize: PREVIEW_COUNT })
      .then((res) => {
        if (cancelled) return;
        setComments(res.items);
        setPendingTotal(res.counts.pending);
        setError(null);
      })
      .catch(() => {
        if (!cancelled)
          setError("تعذّر تحميل التعليقات المعلّقة. حاول تحديث الصفحة.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function handleModerate(id: string, action: "approve" | "reject") {
    setBusyId(id);
    setNotice(null);
    setError(null);
    try {
      await moderatePublicComment(id, action);
      setNotice(
        action === "approve"
          ? "تمت الموافقة على التعليق، وسيظهر الآن في الصفحة العامة."
          : "تم رفض التعليق، ولن يظهر للزوّار.",
      );
      notifyPublicCommentsChanged();
      setReloadKey((k) => k + 1);
    } catch {
      setError(
        action === "approve"
          ? "تعذّرت الموافقة على التعليق. حاول مرة أخرى."
          : "تعذّر رفض التعليق. حاول مرة أخرى.",
      );
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-soft">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Clock className="h-4 w-4 text-accent" />
        <h2 className="font-kufi text-sm font-semibold text-ink">
          تعليقات بانتظار المراجعة
        </h2>
        {!loading && !error && pendingTotal > 0 && (
          <Badge variant="warning">{pendingTotal}</Badge>
        )}
        <Link
          href="/dashboard/comments"
          className="ms-auto inline-flex items-center gap-1.5 font-kufi text-xs text-ink-faint hover:text-ink"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          إدارة كل التعليقات
        </Link>
      </div>

      {notice && (
        <p
          role="status"
          className="mb-3 rounded-lg border border-emerald-300/50 bg-emerald-500/5 px-3 py-2 font-kufi text-xs text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/5 dark:text-emerald-400"
        >
          {notice}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mb-3 flex items-center gap-2 rounded-lg border border-rose-300/50 bg-rose-500/5 px-3 py-2 font-kufi text-xs text-rose-600 dark:border-rose-400/30 dark:bg-rose-400/5 dark:text-rose-400"
        >
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-6 text-ink-faint">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="font-kufi text-xs">جارٍ التحميل…</span>
        </div>
      ) : comments.length === 0 ? (
        error ? null : (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <MessageSquareText className="h-5 w-5 text-ink-faint" />
            <p className="font-kufi text-xs text-ink-faint">
              لا توجد تعليقات معلّقة — كل التعليقات تمت مراجعتها.
            </p>
          </div>
        )
      ) : (
        <>
          <ul className="divide-y divide-line-soft">
            {comments.map((c) => (
              <li key={c.id} className="flex flex-col gap-2 py-3 first:pt-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-kufi text-sm font-semibold text-ink">
                    {c.name}
                  </span>
                  <span className="ms-auto font-kufi text-[0.65rem] text-ink-faint">
                    {formatRelativeTime(c.createdAt)}
                  </span>
                </div>
                <Link
                  href={`/${c.sectionId}#section-comments`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-fit font-kufi text-xs text-ink-faint hover:text-accent"
                >
                  {c.bookTitle} — {c.sectionTitle}
                </Link>
                <p className="line-clamp-3 whitespace-pre-wrap break-words font-naskh text-sm leading-relaxed text-ink-soft">
                  {c.text}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleModerate(c.id, "approve")}
                    disabled={busyId === c.id}
                  >
                    {busyId === c.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )}
                    الموافقة
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-600 dark:text-rose-400"
                    onClick={() => handleModerate(c.id, "reject")}
                    disabled={busyId === c.id}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    الرفض
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {pendingTotal > comments.length && (
            <Link
              href="/dashboard/comments"
              className="mt-2 block text-center font-kufi text-xs font-semibold text-accent hover:underline"
            >
              عرض كل التعليقات المعلّقة ({pendingTotal})
            </Link>
          )}
        </>
      )}
    </div>
  );
}
