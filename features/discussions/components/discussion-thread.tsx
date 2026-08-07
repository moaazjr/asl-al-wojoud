"use client";

import * as React from "react";
import {
  CheckCircle2,
  CircleDot,
  Trash2,
  RotateCcw,
  Sparkles,
  Lock,
} from "lucide-react";
import type { Discussion, Role } from "@/interfaces/types";
import type { DiscussionActions } from "../types";
import { sortByPinnedThenDate } from "../use-section-discussions";
import { Button } from "@/components/ui/button";
import { MessageItem } from "./message-item";

export function DiscussionThread({
  discussion,
  role,
  currentUserId,
  api,
}: {
  discussion: Discussion;
  role: Role | null;
  currentUserId: string | null;
  api: DiscussionActions;
}) {
  const isAdmin = role === "admin";
  const isOwner = currentUserId === discussion.createdById;
  const canManage = isAdmin || isOwner;
  const canResolveAction = isAdmin && discussion.status === "open";
  const canReopenAction = isAdmin && discussion.status === "resolved";
  const isResolved = discussion.status === "resolved";

  const allMessages = sortByPinnedThenDate(discussion.messages);
  const topLevel = allMessages.filter((m) => !m.parentMessageId);

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-paper shadow-soft dark:bg-paper/80 dark:shadow-none">
      <div className="flex items-center gap-2 px-4 pt-3">
        {isResolved ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-kufi text-[0.65rem] font-bold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            مُغلَق
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 font-kufi text-[0.65rem] font-bold text-amber-600 dark:text-amber-400">
            <CircleDot className="h-3 w-3" />
            مفتوح
          </span>
        )}
        {discussion.hasAdminReply && (
          <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 font-kufi text-[0.65rem] font-bold text-accent">
            <Sparkles className="h-3 w-3" />
            ردّ المشرف
          </span>
        )}
        <span className="ms-auto font-kufi text-[0.7rem] text-ink-faint">
          {discussion.messages.length} رسالة
        </span>
      </div>

      <div className="space-y-3 px-4 pb-3 pt-1">
        {topLevel.length > 0 &&
          topLevel.map((m) => {
            const replyList = allMessages.filter(
              (r) => r.parentMessageId === m.id,
            );
            return (
              <MessageItem
                key={m.id}
                discussion={discussion}
                message={m}
                role={role}
                currentUserId={currentUserId}
                api={api}
                replies={replyList}
              />
            );
          })}
      </div>

      {isResolved && (
        <div className="flex items-center justify-center gap-1.5 px-4 pb-3">
          <Lock className="h-3 w-3 text-ink-faint" />
          <span className="font-kufi text-[0.7rem] text-ink-faint">
            هذا التعليق مُغلق ولا يمكن الردّ عليه
          </span>
        </div>
      )}

      {canManage && (
        <div className="flex items-center gap-2 border-t border-line-soft px-4 py-2">
          {canResolveAction && (
            <Button
              size="sm"
              variant="ghost"
              className="text-emerald-600 dark:text-emerald-400"
              onClick={() => void api.resolve(discussion.id)}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              إغلاق
            </Button>
          )}
          {canReopenAction && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => void api.reopen(discussion.id)}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              إعادة الفتح
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="ms-auto text-rose-600 dark:text-rose-400"
            onClick={() => {
              if (confirm("هل تريد حذف هذا التعليق والردود المرافقة؟"))
                void api.deleteDiscussion(discussion.id);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            حذف
          </Button>
        </div>
      )}
    </article>
  );
}