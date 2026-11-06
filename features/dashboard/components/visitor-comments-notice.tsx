"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { usePublicCommentCounts } from "../use-pending-comments";

export function VisitorCommentsNotice() {
  const { counts } = usePublicCommentCounts();
  const pending = counts?.pending ?? 0;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-accent/25 bg-accent-soft/40 px-3.5 py-2.5 font-kufi text-xs text-ink-soft">
      <Info className="h-4 w-4 shrink-0 text-accent" />
      <span>
        هذه الصفحة تعرض نقاشات المستخدمين المسجّلين فقط. تعليقات الزوّار (بدون تسجيل) تُدار من صفحة
        «تعليقات الزوّار».
      </span>
      <Link
        href="/dashboard/comments"
        className="ms-auto rounded-lg bg-accent px-3 py-1 font-semibold text-paper hover:bg-accent-bright"
      >
        تعليقات الزوّار
        {pending > 0 && ` (${pending} بانتظار المراجعة)`}
      </Link>
    </div>
  );
}
