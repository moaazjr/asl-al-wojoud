import type { CommentRepository } from "@/interfaces/CommentRepository";
import type {
  DashboardStats,
  Discussion,
  DiscussionFilter,
  Message,
  User,
} from "@/interfaces/types";
import { permissions } from "./permissions";
import type { NotificationService } from "./NotificationService";

export interface NewDiscussionInput {
  sectionId: string;
  sectionTitle: string;
  bookTitle: string;
  blockIndex: number;
  selectedText: string;
  charStart: number;
  charEnd: number;
  text: string;
}

export interface NewHighlightInput {
  sectionId: string;
  sectionTitle: string;
  bookTitle: string;
  blockIndex: number;
  selectedText: string;
  charStart: number;
  charEnd: number;
}

export class CommentService {
  constructor(
    private readonly repo: CommentRepository,
    private readonly notifications: NotificationService,
  ) {}

  listBySection(sectionId: string): Promise<Discussion[]> {
    return this.repo.getDiscussionsBySection(sectionId);
  }

  listForUser(userId: string): Promise<Discussion[]> {
    return this.repo.getDiscussionsForUser(userId);
  }

  listAll(filter?: DiscussionFilter): Promise<Discussion[]> {
    return this.repo.getAllDiscussions(filter);
  }

  async createDiscussion(
    input: NewDiscussionInput,
    user: User,
  ): Promise<Discussion> {
    const text = input.text.trim();
    if (text.length === 0) throw new Error("النص مطلوب");
    if (text.length > 1000) throw new Error("النص طويل جدًا (الحد ١٠٠٠ حرف)");
    return this.repo.createDiscussion({
      sectionId: input.sectionId,
      sectionTitle: input.sectionTitle,
      bookTitle: input.bookTitle,
      blockIndex: input.blockIndex,
      selectedText: input.selectedText.slice(0, 300),
      charStart: input.charStart,
      charEnd: input.charEnd,
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      text,
    });
  }

  createHighlight(input: NewHighlightInput, user: User): Promise<Discussion> {
    return this.repo.createHighlight({
      sectionId: input.sectionId,
      sectionTitle: input.sectionTitle,
      bookTitle: input.bookTitle,
      blockIndex: input.blockIndex,
      selectedText: input.selectedText.slice(0, 300),
      charStart: input.charStart,
      charEnd: input.charEnd,
      authorId: user.id,
    });
  }

  removeHighlight(id: string, user: User): Promise<void> {
    return this.repo.removeHighlight(id, user.id);
  }

  async addMessage(
    discussionId: string,
    text: string,
    user: User,
    replyToMessageId?: string,
  ): Promise<Message | null> {
    const trimmed = text.trim();
    if (trimmed.length === 0) throw new Error("النص مطلوب");
    if (trimmed.length > 1000) throw new Error("النص طويل جدًا");

    const discussion = await this.repo.getDiscussion(discussionId);
    if (!discussion) throw new Error("النقاش غير موجود");

    const isAdmin = user.role === "admin";
    if (!isAdmin) {
      throw new Error("يمكن للمشرف فقط الردّ على التعليقات");
    }

    const message = await this.repo.addMessage({
      discussionId,
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      text: trimmed,
      parentMessageId: replyToMessageId,
    });

    if (isAdmin && discussion.createdById !== user.id) {
      await this.notifications.notify({
        userId: discussion.createdById,
        type: "admin-reply",
        discussionId: discussion.id,
        sectionId: discussion.sectionId,
        sectionTitle: discussion.sectionTitle,
        text: `ردّ المشرف على نقاشك: «${discussion.selectedText.slice(0, 60)}»`,
      });
    }

    return message;
  }

  async editMessage(
    discussionId: string,
    messageId: string,
    text: string,
    user: User,
  ): Promise<void> {
    const trimmed = text.trim();
    if (trimmed.length === 0) throw new Error("النص مطلوب");
    const discussion = await this.repo.getDiscussion(discussionId);
    const message = discussion?.messages.find((m) => m.id === messageId);
    if (!message) throw new Error("التعليق غير موجود");
    if (
      !(user.role === "admin" && message.authorRole === "admin"
        ? true
        : message.authorId === user.id)
    ) {
      throw new Error("غير مصرّح");
    }
    await this.repo.editMessage(discussionId, messageId, trimmed);
  }

  async deleteMessage(
    discussionId: string,
    messageId: string,
    user: User,
  ): Promise<void> {
    const discussion = await this.repo.getDiscussion(discussionId);
    const message = discussion?.messages.find((m) => m.id === messageId);
    if (!message) return;
    const allowed =
      user.role === "admin" || message.authorId === user.id;
    if (!allowed) throw new Error("غير مصرّح بحذف هذا التعليق");
    await this.repo.deleteMessage(discussionId, messageId);
  }

  toggleLike(
    discussionId: string,
    messageId: string,
    userId: string,
  ): Promise<void> {
    return this.repo.toggleLike(discussionId, messageId, userId);
  }

  async resolve(discussionId: string, user: User): Promise<void> {
    if (!permissions.canResolve(user.role)) throw new Error("غير مصرّح");
    const discussion = await this.repo.getDiscussion(discussionId);
    if (!discussion) return;
    await this.repo.resolve(discussionId, user.id);
    if (discussion.createdById !== user.id) {
      await this.notifications.notify({
        userId: discussion.createdById,
        type: "discussion-resolved",
        discussionId: discussion.id,
        sectionId: discussion.sectionId,
        sectionTitle: discussion.sectionTitle,
        text: `تمّ إغلاق نقاشك: «${discussion.selectedText.slice(0, 60)}»`,
      });
    }
  }

  async reopen(discussionId: string, user: User): Promise<void> {
    if (!permissions.canReopen(user.role)) throw new Error("غير مصرّح");
    const discussion = await this.repo.getDiscussion(discussionId);
    if (!discussion) return;
    await this.repo.reopen(discussionId, user.id);
    if (discussion.createdById !== user.id) {
      await this.notifications.notify({
        userId: discussion.createdById,
        type: "discussion-reopened",
        discussionId: discussion.id,
        sectionId: discussion.sectionId,
        sectionTitle: discussion.sectionTitle,
        text: `أُعيد فتح نقاشك: «${discussion.selectedText.slice(0, 60)}»`,
      });
    }
  }

  pinMessage(discussionId: string, messageId: string, user: User): Promise<void> {
    if (!permissions.canPin(user.role)) throw new Error("غير مصرّح");
    return this.repo.pinMessage(discussionId, messageId);
  }

  unpinMessage(discussionId: string, user: User): Promise<void> {
    if (!permissions.canPin(user.role)) throw new Error("غير مصرّح");
    return this.repo.unpinMessage(discussionId);
  }

  async deleteDiscussion(discussionId: string, user: User): Promise<void> {
    const discussion = await this.repo.getDiscussion(discussionId);
    if (!discussion) return;
    const allowed =
      user.role === "admin" || discussion.createdById === user.id;
    if (!allowed) throw new Error("غير مصرّح بحذف هذا النقاش");
    await this.repo.deleteDiscussion(discussionId);
  }

  async resolveMany(ids: string[], user: User): Promise<void> {
    if (!permissions.canResolve(user.role)) throw new Error("غير مصرّح");
    await this.repo.resolveMany(ids, user.id);
  }

  async deleteMany(ids: string[], user: User): Promise<void> {
    if (!permissions.canDeleteAny(user.role)) throw new Error("غير مصرّح");
    await this.repo.deleteMany(ids);
  }

  async getStats(userCount: number): Promise<DashboardStats> {
    const all = await this.repo.getAllDiscussions();
    const messages = all.flatMap((d) => d.messages);
    const open = all.filter((d) => d.status === "open").length;
    const resolved = all.filter((d) => d.status === "resolved").length;

    const byChapter = new Map<string, number>();
    for (const d of all) {
      byChapter.set(d.bookTitle, (byChapter.get(d.bookTitle) ?? 0) + 1);
    }
    let mostCommented: DashboardStats["mostCommentedChapter"] = null;
    for (const [bookTitle, count] of byChapter) {
      if (!mostCommented || count > mostCommented.count) {
        mostCommented = { bookTitle, count };
      }
    }

    const recentMessages = [...messages]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 8);

    return {
      totalUsers: userCount,
      totalMessages: messages.length,
      openDiscussions: open,
      resolvedDiscussions: resolved,
      totalDiscussions: all.length,
      mostCommentedChapter: mostCommented,
      recentMessages,
    };
  }
}
