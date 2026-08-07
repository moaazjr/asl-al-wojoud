"use client";

import * as React from "react";
import type { Discussion, Message } from "@/interfaces/types";
import { getCommentService } from "@/services/container";
import { useAuth } from "@/features/auth/use-auth";
import { useNotifications } from "@/features/notifications/use-notifications";

export function useSectionDiscussions(
  sectionId: string,
  meta: { sectionTitle: string; bookTitle: string },
) {
  const { user } = useAuth();
  const { refresh: refreshNotifications } = useNotifications();
  const [discussions, setDiscussions] = React.useState<Discussion[]>([]);
  const [loading, setLoading] = React.useState(true);

  const reload = React.useCallback(() => {
    getCommentService()
      .listBySection(sectionId)
      .then(setDiscussions)
      .catch(() => void 0)
      .finally(() => setLoading(false));
  }, [sectionId]);

  React.useEffect(() => {
    reload();
  }, [reload]);

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("aa:")) reload();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [reload]);

  const base = React.useMemo(
    () => ({
      sectionId,
      sectionTitle: meta.sectionTitle,
      bookTitle: meta.bookTitle,
    }),
    [sectionId, meta.sectionTitle, meta.bookTitle],
  );

  const createComment = React.useCallback(
    async (text: string): Promise<Discussion | null> => {
      if (!user) return null;
      const d = await getCommentService().createComment(
        { ...base, text },
        user,
      );
      reload();
      return d;
    },
    [user, base, reload],
  );

  const addMessage = React.useCallback(
    async (discussionId: string, text: string, replyToMessageId?: string): Promise<void> => {
      if (!user) return;
      await getCommentService().addMessage(discussionId, text, user, replyToMessageId);
      reload();
      refreshNotifications();
    },
    [user, reload, refreshNotifications],
  );

  const toggleLike = React.useCallback(
    async (discussionId: string, messageId: string): Promise<void> => {
      if (!user) return;
      await getCommentService().toggleLike(discussionId, messageId, user.id);
      reload();
    },
    [user, reload],
  );

  const editMessage = React.useCallback(
    async (
      discussionId: string,
      messageId: string,
      text: string,
    ): Promise<void> => {
      if (!user) return;
      await getCommentService().editMessage(discussionId, messageId, text, user);
      reload();
    },
    [user, reload],
  );

  const deleteMessage = React.useCallback(
    async (discussionId: string, messageId: string): Promise<void> => {
      if (!user) return;
      await getCommentService().deleteMessage(discussionId, messageId, user);
      reload();
    },
    [user, reload],
  );

  const resolve = React.useCallback(
    async (discussionId: string): Promise<void> => {
      if (!user) return;
      await getCommentService().resolve(discussionId, user);
      reload();
      refreshNotifications();
    },
    [user, reload, refreshNotifications],
  );

  const reopen = React.useCallback(
    async (discussionId: string): Promise<void> => {
      if (!user) return;
      await getCommentService().reopen(discussionId, user);
      reload();
      refreshNotifications();
    },
    [user, reload, refreshNotifications],
  );

  const pinMessage = React.useCallback(
    async (discussionId: string, messageId: string): Promise<void> => {
      if (!user) return;
      await getCommentService().pinMessage(discussionId, messageId, user);
      reload();
    },
    [user, reload],
  );

  const unpin = React.useCallback(
    async (discussionId: string): Promise<void> => {
      if (!user) return;
      await getCommentService().unpinMessage(discussionId, user);
      reload();
    },
    [user, reload],
  );

  const deleteDiscussion = React.useCallback(
    async (discussionId: string): Promise<void> => {
      if (!user) return;
      await getCommentService().deleteDiscussion(discussionId, user);
      reload();
    },
    [user, reload],
  );

  return {
    user,
    discussions,
    loading,
    reload,
    createComment,
    addMessage,
    toggleLike,
    editMessage,
    deleteMessage,
    resolve,
    reopen,
    pinMessage,
    unpin,
    deleteDiscussion,
  };
}

export type SectionDiscussionsApi = ReturnType<typeof useSectionDiscussions>;

export function sortByPinnedThenDate(messages: Message[]): Message[] {
  return [...messages].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return a.createdAt - b.createdAt;
  });
}