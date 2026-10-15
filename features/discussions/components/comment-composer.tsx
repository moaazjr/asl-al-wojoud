"use client";

import * as React from "react";
import { Lock, Ban } from "lucide-react";
import type { DiscussionActions } from "../types";
import { PublicCommentForm } from "@/features/comments/components/public-comment-form";

export function CommentComposer({
  api,
  sectionId,
}: {
  api: DiscussionActions;
  sectionId: string;
}) {
  const commentsEnabled = api.settings?.commentsEnabled ?? true;
  const sectionLocked = api.settings?.lockedSections.includes(sectionId) ?? false;

  if (!commentsEnabled) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-dashed border-rose-300/50 bg-rose-500/5 py-3 text-center dark:border-rose-400/30 dark:bg-rose-400/5">
        <Ban className="h-4 w-4 shrink-0 text-rose-500 dark:text-rose-400" />
        <p className="font-kufi text-xs text-rose-600 dark:text-rose-400">
          التعليقات معطّلة من قبل المشرف
        </p>
      </div>
    );
  }

  if (sectionLocked) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-dashed border-amber-300/50 bg-amber-500/5 py-3 text-center dark:border-amber-400/30 dark:bg-amber-400/5">
        <Lock className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-400" />
        <p className="font-kufi text-xs text-amber-600 dark:text-amber-400">
          هذا المبحث مقفل — لا يمكن إضافة تعليقات جديدة
        </p>
      </div>
    );
  }

  return (
    <PublicCommentForm
      sectionId={sectionId}
      sectionTitle={api.sectionTitle ?? ""}
      bookTitle={api.bookTitle ?? ""}
    />
  );
}
