import type { User } from "@/interfaces/types";

export interface DiscussionActions {
  user: User | null;
  addMessage: (discussionId: string, text: string, replyToMessageId?: string) => Promise<void>;
  toggleLike: (
    discussionId: string,
    messageId: string,
  ) => Promise<void>;
  editMessage: (
    discussionId: string,
    messageId: string,
    text: string,
  ) => Promise<void>;
  deleteMessage: (
    discussionId: string,
    messageId: string,
  ) => Promise<void>;
  resolve: (discussionId: string) => Promise<void>;
  reopen: (discussionId: string) => Promise<void>;
  pinMessage: (
    discussionId: string,
    messageId: string,
  ) => Promise<void>;
  unpin: (discussionId: string) => Promise<void>;
  deleteDiscussion: (discussionId: string) => Promise<void>;
}
