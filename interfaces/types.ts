export type Role = "user" | "admin";

export type DiscussionStatus = "open" | "resolved";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: number;
}

export interface StoredUser extends User {
  passwordHash: string;
}

export interface Session {
  userId: string;
  token: string;
  expiresAt: number;
}

export interface Message {
  id: string;
  discussionId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  text: string;
  createdAt: number;
  editedAt?: number;
  parentMessageId?: string;
  pinned?: boolean;
  likes: string[];
}

export interface Discussion {
  id: string;
  sectionId: string;
  sectionTitle: string;
  bookTitle: string;
  status: DiscussionStatus;
  resolvedAt?: number;
  resolvedById?: string;
  pinnedMessageId?: string;
  createdAt: number;
  createdById: string;
  messages: Message[];
  hasAdminReply?: boolean;
}

export type NotificationType =
  | "admin-reply"
  | "discussion-resolved"
  | "discussion-reopened"
  | "discussion-deleted";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  discussionId: string;
  sectionId: string;
  sectionTitle: string;
  text: string;
  read: boolean;
  createdAt: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalMessages: number;
  openDiscussions: number;
  resolvedDiscussions: number;
  totalDiscussions: number;
  mostCommentedChapter: { bookTitle: string; count: number } | null;
  recentMessages: Message[];
}

export interface DiscussionFilter {
  status?: DiscussionStatus;
  search?: string;
  sectionId?: string;
}
