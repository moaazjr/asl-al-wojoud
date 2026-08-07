"use client";

import * as React from "react";
import { getCommentService } from "@/services/container";
import { useAuth } from "@/features/auth/use-auth";
import { useNotifications } from "@/features/notifications/use-notifications";
import type { CommentMeta, DiscussionActions } from "./types";

export function useDiscussionActions(
  reload: () => void,
): DiscussionActions {
  const { user } = useAuth();
  const { refresh: refreshNotifications } = useNotifications();

  const createComment = React.useCallback(
    async (
      text: string,
      meta?: CommentMeta,
    ): Promise<import("@/interfaces/types").Discussion | null> => {
      if (!user || !meta) return null;
      const d = await getCommentService().createComment(
        { ...meta, text },
        user,
      );
      reload();
      return d;
    },
    [user, reload],
  );

  const addMessage = React.useCallback(
    async (discussionId: string, text: string, replyToMessageId?: string) => {
      if (!user) return;
      await getCommentService().addMessage(discussionId, text, user, replyToMessageId);
      reload();
      refreshNotifications();
    },
    [user, reload, refreshNotifications],
  );

  const toggleLike = React.useCallback(
    async (discussionId: string, messageId: string) => {
      if (!user) return;
      await getCommentService().toggleLike(discussionId, messageId, user.id);
      reload();
    },
    [user, reload],
  );

  const editMessage = React.useCallback(
    async (discussionId: string, messageId: string, text: string) => {
      if (!user) return;
      await getCommentService().editMessage(discussionId, messageId, text, user);
      reload();
    },
    [user, reload],
  );

  const deleteMessage = React.useCallback(
    async (discussionId: string, messageId: string) => {
      if (!user) return;
      await getCommentService().deleteMessage(discussionId, messageId, user);
      reload();
    },
    [user, reload],
  );

  const resolve = React.useCallback(
    async (discussionId: string) => {
      if (!user) return;
      await getCommentService().resolve(discussionId, user);
      reload();
      refreshNotifications();
    },
    [user, reload, refreshNotifications],
  );

  const reopen = React.useCallback(
    async (discussionId: string) => {
      if (!user) return;
      await getCommentService().reopen(discussionId, user);
      reload();
      refreshNotifications();
    },
    [user, reload, refreshNotifications],
  );

  const pinMessage = React.useCallback(
    async (discussionId: string, messageId: string) => {
      if (!user) return;
      await getCommentService().pinMessage(discussionId, messageId, user);
      reload();
    },
    [user, reload],
  );

  const unpin = React.useCallback(
    async (discussionId: string) => {
      if (!user) return;
      await getCommentService().unpinMessage(discussionId, user);
      reload();
    },
    [user, reload],
  );

  const deleteDiscussion = React.useCallback(
    async (discussionId: string) => {
      if (!user) return;
      await getCommentService().deleteDiscussion(discussionId, user);
      reload();
    },
    [user, reload],
  );

  return {
    user,
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
