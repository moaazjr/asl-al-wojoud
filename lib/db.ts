import type { Prisma } from "@prisma/client";
import type {
  AppNotification,
  CommentModerationStatus,
  Discussion,
  Message,
  PublicComment,
  Question,
  User,
} from "@/interfaces/types";

type NoExt = Record<string, never>;
type UserRow = Prisma.UserGetPayload<NoExt>;
type MessageRow = Prisma.MessageGetPayload<NoExt>;
type NotificationRow = Prisma.NotificationGetPayload<NoExt>;
type PublicCommentRow = Prisma.PublicCommentGetPayload<NoExt>;
type QuestionRow = Prisma.QuestionGetPayload<NoExt>;
type DiscussionWithMessages = Prisma.DiscussionGetPayload<{
  include: { messages: true };
}>;

export function mapUser(u: UserRow): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role === "ADMIN" ? "admin" : "user",
    createdAt: u.createdAt.getTime(),
  };
}

export function mapMessage(m: MessageRow): Message {
  return {
    id: m.id,
    discussionId: m.discussionId,
    authorId: m.authorId,
    authorName: m.authorName,
    authorRole: m.authorRole === "ADMIN" ? "admin" : "user",
    text: m.text,
    createdAt: m.createdAt.getTime(),
    editedAt: m.editedAt?.getTime(),
    parentMessageId: m.parentMessageId ?? undefined,
    pinned: m.pinned,
    likes: m.likes,
  };
}

export function mapNotification(n: NotificationRow): AppNotification {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type as AppNotification["type"],
    discussionId: n.discussionId,
    sectionId: n.sectionId,
    sectionTitle: n.sectionTitle,
    text: n.text,
    read: n.read,
    createdAt: n.createdAt.getTime(),
  };
}

export function sortDiscussionsByLastMessage(
  discussions: Discussion[],
): Discussion[] {
  return [...discussions].sort((a, b) => {
    const am = a.messages[a.messages.length - 1]?.createdAt ?? a.createdAt;
    const bm = b.messages[b.messages.length - 1]?.createdAt ?? b.createdAt;
    return bm - am;
  });
}

export function mapDiscussion(d: DiscussionWithMessages): Discussion {
  return {
    id: d.id,
    sectionId: d.sectionId,
    sectionTitle: d.sectionTitle,
    bookTitle: d.bookTitle,
    status: d.status === "RESOLVED" ? "resolved" : "open",
    resolvedAt: d.resolvedAt?.getTime(),
    resolvedById: d.resolvedById ?? undefined,
    pinnedMessageId: d.pinnedMessageId ?? undefined,
    hasAdminReply: d.hasAdminReply,
    createdAt: d.createdAt.getTime(),
    createdById: d.createdById,
    messages: d.messages.map(mapMessage),
  };
}

const COMMENT_STATUS_MAP: Record<
  PublicCommentRow["status"],
  CommentModerationStatus
> = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

export function mapPublicComment(c: PublicCommentRow): PublicComment {
  return {
    id: c.id,
    sectionId: c.sectionId,
    sectionTitle: c.sectionTitle,
    bookTitle: c.bookTitle,
    name: c.name,
    email: c.email ?? null,
    text: c.text,
    status: COMMENT_STATUS_MAP[c.status],
    createdAt: c.createdAt.getTime(),
    moderatedAt: c.moderatedAt?.getTime() ?? null,
    adminReply: c.adminReply ?? null,
    adminReplyAt: c.adminReplyAt?.getTime() ?? null,
  };
}

export function mapApprovedPublicComment(c: PublicCommentRow): PublicComment {
  return { ...mapPublicComment(c), email: null };
}

export function mapQuestion(q: QuestionRow): Question {
  return {
    id: q.id,
    name: q.name,
    email: q.email ?? null,
    chapter: q.chapter ?? null,
    text: q.text,
    isRead: q.isRead,
    createdAt: q.createdAt.getTime(),
  };
}

export function mapPublicCommentToDiscussion(c: PublicCommentRow): Discussion {
  const id = `pc_${c.id}`;
  const rootId = `pc_m_${c.id}`;
  const ts = c.createdAt.getTime();
  const messages: Message[] = [
    {
      id: rootId,
      discussionId: id,
      authorId: `public:${c.id}`,
      authorName: c.name,
      authorRole: "user",
      text: c.text,
      createdAt: ts,
      likes: [],
    },
  ];
  if (c.adminReply) {
    messages.push({
      id: `pc_r_${c.id}`,
      discussionId: id,
      authorId: `admin:${c.adminReplyById ?? "site"}`,
      authorName: "المشرف",
      authorRole: "admin",
      text: c.adminReply,
      createdAt: c.adminReplyAt?.getTime() ?? ts,
      parentMessageId: rootId,
      likes: [],
    });
  }
  return {
    id,
    sectionId: c.sectionId,
    sectionTitle: c.sectionTitle,
    bookTitle: c.bookTitle,
    status: "open",
    createdAt: ts,
    createdById: `public:${c.id}`,
    hasAdminReply: Boolean(c.adminReply),
    isPublic: true,
    messages,
  };
}
