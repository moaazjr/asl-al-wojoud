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
  Trash2,
  XCircle,
} from "lucide-react";
import type { PublicComment } from "@/interfaces/types";
import { formatRelativeTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  deletePublicComment,
  listPublicComments,
  moderatePublicComment,
} from "@/features/comments/api";

export function PendingCommentsPanel() {
  const [comments, setComments] = React.useState<PublicComment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPublicComments("pending");
      setComments(data);
    } catch {
      setError("تعذّر تحميل التعليقات المعلّقة. حاول تحديث الصفحة.");
    } finally {
      setLoading(false);
    }
  }, []);

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

  async function handleModerate(
    id: string,
    action: "approve" | "reject",
  ) {
    setBusyId(id);
    setNotice(null);
    setError(null);
    try {
      await moderatePublicComment(id, action);
      setComments((prev) => prev.filter((c) => c.id !== id));
      setNotice(
        action === "approve"
          ? "تمت الموافقة على التعليق، وسيظهر الآن في الصفحة العامة."
          : "تم رفض التعليق، ولن يظهر للزوّار.",
      );
    } catch {
      setError(
        action === "approve"
          ? "تعذّرت الموافقة على التعليق. حاول مرة أخرى."
          : "تعذّر رفض التعليق. حاول مرة أخرى.",
      );
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل تريد حذف هذا التعليق نهائيًا؟ لا يمكن التراجع.")) return;
    setBusyId(id);
    setNotice(null);
    setError(null);
    try {
      await deletePublicComment(id);
      setComments((prev) => prev.filter((c) => c.id !== id));
      setNotice("تم حذف التعليق نهائيًا.");
    } catch {
      setError("تعذّر حذف التعليق. حاول مرة أخرى.");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-4 shadow-soft">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Clock className="h-4 w-4 text-accent" />
        <h2 className="font-kufi text-sm font-semibold text-ink">
          التعليقات المعلّقة
        </h2>
        {!loading && !error && comments.length > 0 && (
          <Badge variant="warning">{comments.length}</Badge>
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
        <div className="flex flex-col items-center gap-2 py-8 text-center">
          <MessageSquareText className="h-5 w-5 text-ink-faint" />
          <p className="font-kufi text-xs text-ink-faint">
            لا توجد تعليقات معلّقة — كل التعليقات تمت مراجعتها.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-line-soft">
          {comments.map((c) => (
            <li key={c.id} className="flex flex-col gap-2 py-3 first:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-kufi text-sm font-semibold text-ink">
                  {c.name}
                  {c.email && (
                    <span className="ms-1 font-normal text-ink-faint">
                      ({c.email})
                    </span>
                  )}
                </span>
                <span className="ms-auto font-kufi text-[0.65rem] text-ink-faint">
                  {formatRelativeTime(c.createdAt)}
                </span>
              </div>
              <p className="font-kufi text-xs text-ink-faint">
                المبحث: {c.bookTitle} — {c.sectionTitle}
              </p>
              <p className="whitespace-pre-wrap break-words font-naskh text-sm leading-relaxed text-ink-soft">
                {c.text}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
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
                <Link
                  href={`/${c.sectionId}#section-comments`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ms-auto inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-kufi text-xs text-ink-faint hover:text-ink"
                >
                  فتح المبحث
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
