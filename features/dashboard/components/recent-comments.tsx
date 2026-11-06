"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock, ExternalLink, Hourglass, Inbox, XCircle } from "lucide-react";
import type { PublicComment } from "@/interfaces/types";
import { useDashboard } from "../use-dashboard";
import { formatRelativeTime, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { listPublicComments } from "@/features/comments/api";

const LIMIT = 30;

type Item = {
  key: string;
  kind: "visitor" | "member";
  name: string;
  isAdmin: boolean;
  text: string;
  createdAt: number;
  sectionId?: string;
  where?: string;
  status?: PublicComment["status"];
};

const STATUS_BADGE = {
  pending: { label: "بانتظار المراجعة", variant: "warning", icon: Hourglass },
  approved: { label: "معتمد", variant: "success", icon: CheckCircle2 },
  rejected: { label: "مرفوض", variant: "outline", icon: XCircle },
} as const;

export function RecentComments() {
  const { stats, discussions, loading } = useDashboard();
  const [visitor, setVisitor] = React.useState<PublicComment[] | null>(null);
  const [visitorError, setVisitorError] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    listPublicComments({ status: "all", pageSize: LIMIT })
      .then((res) => {
        if (!cancelled) setVisitor(res.items);
      })
      .catch(() => {
        if (!cancelled) setVisitorError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items = React.useMemo<Item[]>(() => {
    const titleByDiscussion = new Map(discussions.map((d) => [d.id, d]));
    const members: Item[] = (stats?.recentMessages ?? []).map((m) => {
      const d = titleByDiscussion.get(m.discussionId);
      return {
        key: `m_${m.id}`,
        kind: "member",
        name: m.authorName,
        isAdmin: m.authorRole === "admin",
        text: m.text,
        createdAt: m.createdAt,
        sectionId: d?.sectionId,
        where: d ? `${d.bookTitle} · ${d.sectionTitle}` : undefined,
      };
    });
    const visitors: Item[] = (visitor ?? []).map((c) => ({
      key: `v_${c.id}`,
      kind: "visitor",
      name: c.name,
      isAdmin: false,
      text: c.text,
      createdAt: c.createdAt,
      sectionId: c.sectionId,
      where: `${c.bookTitle} · ${c.sectionTitle}`,
      status: c.status,
    }));
    return [...members, ...visitors].sort((a, b) => b.createdAt - a.createdAt).slice(0, LIMIT);
  }, [stats, discussions, visitor]);

  const busy = loading || visitor === null && !visitorError;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-kufi text-2xl font-bold text-ink">أحدث التعليقات</h1>
        <p className="font-kufi text-sm text-ink-faint">
          آخر تعليقات الزوّار ورسائل المستخدمين المسجّلين، من الأحدث إلى الأقدم
        </p>
      </div>

      {visitorError && (
        <p role="alert" className="flex items-center gap-2 rounded-lg border border-rose-300/50 bg-rose-500/5 px-3 py-2 font-kufi text-xs text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          تعذّر تحميل تعليقات الزوّار؛ المعروض هنا رسائل المستخدمين المسجّلين فقط.
        </p>
      )}

      {busy ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl border border-line bg-paper-deep/40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-12 text-center">
          <Inbox className="h-6 w-6 text-ink-faint" />
          <p className="font-kufi text-sm text-ink-faint">لا تعليقات بعد</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((m) => {
            const status = m.status ? STATUS_BADGE[m.status] : null;
            return (
              <div key={m.key} className="flex items-start gap-3 rounded-2xl border border-line bg-card p-3.5">
                <Avatar name={m.name} isAdmin={m.isAdmin} className="h-9 w-9" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-kufi text-sm font-semibold text-ink">{m.name}</span>
                    {m.isAdmin && (
                      <Badge variant="admin" className="text-[0.6rem]">مشرف</Badge>
                    )}
                    <Badge variant="outline" className="text-[0.6rem]">
                      {m.kind === "visitor" ? "زائر" : "مستخدم مسجّل"}
                    </Badge>
                    {status && (
                      <Badge variant={status.variant} className="gap-1 text-[0.6rem]">
                        <status.icon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    )}
                    <span className="ms-auto inline-flex items-center gap-1 font-kufi text-[0.7rem] text-ink-faint">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(m.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 whitespace-pre-wrap break-words font-naskh text-sm leading-relaxed text-ink-soft">
                    {m.text}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-kufi text-[0.65rem] text-ink-faint">
                    <span>{formatDate(m.createdAt)}</span>
                    {m.sectionId && (
                      <Link
                        href={`/${m.sectionId}#section-comments`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 hover:text-accent"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {m.where ?? m.sectionId}
                      </Link>
                    )}
                    {m.kind === "visitor" && m.status === "pending" && (
                      <Link
                        href="/dashboard/comments"
                        className={cn("font-semibold text-accent hover:underline")}
                      >
                        مراجعة الآن
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
