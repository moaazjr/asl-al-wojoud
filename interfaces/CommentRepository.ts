import type { Discussion, DiscussionFilter, Message } from "./types";

export interface CreateHighlightInput {
  sectionId: string;
  sectionTitle: string;
  bookTitle: string;
  blockIndex: number;
  selectedText: string;
  charStart: number;
  charEnd: number;
  authorId: string;
}

export interface CreateDiscussionInput {
  sectionId: string;
  sectionTitle: string;
  bookTitle: string;
  blockIndex: number;
  selectedText: string;
  charStart: number;
  charEnd: number;
  authorId: string;
  authorName: string;
  authorRole: Message["authorRole"];
  text: string;
}

export interface AddMessageInput {
  discussionId: string;
  authorId: string;
  authorName: string;
  authorRole: Message["authorRole"];
  text: string;
  parentMessageId?: string;
}

export interface CommentRepository {
  getDiscussionsBySection(sectionId: string): Promise<Discussion[]>;
  getDiscussion(id: string): Promise<Discussion | null>;
  getDiscussionsForUser(userId: string): Promise<Discussion[]>;
  getAllDiscussions(filter?: DiscussionFilter): Promise<Discussion[]>;
  createDiscussion(input: CreateDiscussionInput): Promise<Discussion>;
  createHighlight(input: CreateHighlightInput): Promise<Discussion>;
  removeHighlight(id: string, userId: string): Promise<void>;
  addMessage(input: AddMessageInput): Promise<Message | null>;
  editMessage(
    discussionId: string,
    messageId: string,
    text: string,
  ): Promise<void>;
  deleteMessage(discussionId: string, messageId: string): Promise<void>;
  toggleLike(
    discussionId: string,
    messageId: string,
    userId: string,
  ): Promise<void>;
  resolve(
    discussionId: string,
    resolvedById: string,
  ): Promise<void>;
  reopen(discussionId: string, actorId: string): Promise<void>;
  pinMessage(discussionId: string, messageId: string): Promise<void>;
  unpinMessage(discussionId: string): Promise<void>;
  deleteDiscussion(discussionId: string): Promise<void>;
  resolveMany(ids: string[], actorId: string): Promise<void>;
  deleteMany(ids: string[]): Promise<void>;
}
