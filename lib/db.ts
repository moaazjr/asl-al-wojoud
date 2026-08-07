import type { Prisma } from "@prisma/client";
import type {
  AppNotification,
  Discussion,
  Message,
  User,
} from "@/interfaces/types";

type NoExt = Record<string, never>;
type UserRow = Prisma.UserGetPayload<NoExt>;
type MessageRow = Prisma.MessageGetPayload<NoExt>;
type NotificationRow = Prisma.NotificationGetPayload<NoExt>;
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
