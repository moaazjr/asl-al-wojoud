"use client";

import * as React from "react";
import Link from "next/link";
import { Inbox, Loader2, LogIn } from "lucide-react";
import type { Discussion } from "@/interfaces/types";
import { getCommentService } from "@/services/container";
import { useAuth } from "@/features/auth/use-auth";
import { useDiscussionActions } from "@/features/discussions/use-discussion-actions";
import { Button } from "@/components/ui/button";
import { DiscussionThread } from "@/features/discussions/components/discussion-thread";

export function MyDiscussions() {
  const { user, loading: authLoading, setAuthDialogOpen } = useAuth();
  const [discussions, setDiscussions] = React.useState<Discussion[]>([]);
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(() => {
    const u = user;
    if (!u) return;
    getCommentService()
      .listForUser(u.id)
      .then(setDiscussions)
      .catch(() => void 0)
      .finally(() => setLoading(false));
  }, [user]);

  React.useEffect(() => {
    if (user) reload();
  }, [user, reload]);

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("aa:")) reload();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [reload]);

  const actions = useDiscussionActions(reload);

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <LogIn className="h-7 w-7" />
        </span>
        <h1 className="font-kufi text-xl font-bold text-ink">سجّل الدخول</h1>
        <p className="font-kufi text-sm text-ink-faint">
          لعرض تعليقاتك ومتابعة ردود المشرفين
        </p>
        <Button onClick={() => setAuthDialogOpen(true)}>تسجيل الدخول</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-kufi text-2xl font-bold text-ink">تعليقاتي</h1>
        <p className="font-kufi text-sm text-ink-faint">
          تعليقاتك وردود المشرفين عليها
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-accent" />
        </div>
      ) : discussions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line py-16 text-center">
          <Inbox className="h-6 w-6 text-ink-faint" />
          <p className="font-kufi text-sm text-ink-faint">
            لم تكتب أي تعليق بعد
          </p>
          <Link
            href="/"
            className="rounded-lg bg-accent px-4 py-2 font-kufi text-sm font-medium text-paper hover:bg-accent-bright"
          >
            تصفّح الكتاب
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((d) => (
            <DiscussionThread
              key={d.id}
              discussion={d}
              role={user.role}
              currentUserId={user.id}
              api={actions}
            />
          ))}
        </div>
      )}
    </div>
  );
}
