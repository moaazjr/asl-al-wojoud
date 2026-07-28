import type {
  AddMessageInput,
  CommentRepository,
  CreateDiscussionInput,
  CreateHighlightInput,
} from "@/interfaces/CommentRepository";
import type { Discussion, DiscussionFilter, Message } from "@/interfaces/types";
import { readJSON, STORAGE_KEYS, uid, writeJSON } from "./storage";

async function load(): Promise<Discussion[]> {
  return readJSON<Discussion[]>(STORAGE_KEYS.discussions, []);
}

async function save(discussions: Discussion[]): Promise<void> {
  writeJSON(STORAGE_KEYS.discussions, discussions);
}

function sortDesc(a: Discussion, b: Discussion): number {
  const am = a.messages[a.messages.length - 1]?.createdAt ?? a.createdAt;
  const bm = b.messages[b.messages.length - 1]?.createdAt ?? b.createdAt;
  return bm - am;
}

function applyFilter(
  discussions: Discussion[],
  filter: DiscussionFilter | undefined,
): Discussion[] {
  if (!filter) return discussions;
  let out = discussions;
  if (filter.status) out = out.filter((d) => d.status === filter.status);
  if (filter.sectionId)
    out = out.filter((d) => d.sectionId === filter.sectionId);
  if (filter.search) {
    const q = filter.search.trim().toLowerCase();
    out = out.filter(
      (d) =>
        d.selectedText.toLowerCase().includes(q) ||
        d.sectionTitle.toLowerCase().includes(q) ||
        d.messages.some(
          (m) =>
            m.text.toLowerCase().includes(q) ||
            m.authorName.toLowerCase().includes(q),
        ),
    );
  }
  return out;
}

export class LocalStorageCommentRepository implements CommentRepository {
  async getDiscussionsBySection(sectionId: string): Promise<Discussion[]> {
    const all = await load();
    return all
      .filter((d) => d.sectionId === sectionId)
      .sort(sortDesc);
  }

  async getDiscussion(id: string): Promise<Discussion | null> {
    const all = await load();
    return all.find((d) => d.id === id) ?? null;
  }

  async getDiscussionsForUser(userId: string): Promise<Discussion[]> {
    const all = await load();
    return all.filter((d) => d.createdById === userId).sort(sortDesc);
  }

  async getAllDiscussions(filter?: DiscussionFilter): Promise<Discussion[]> {
    const all = await load();
    return applyFilter(all, filter).sort(sortDesc);
  }

  async createDiscussion(input: CreateDiscussionInput): Promise<Discussion> {
    const all = await load();
    const now = Date.now();
    const firstMessage: Message = {
      id: uid(),
      discussionId: "",
      authorId: input.authorId,
      authorName: input.authorName,
      authorRole: input.authorRole,
      text: input.text,
      createdAt: now,
      likes: [],
    };
    const discussion: Discussion = {
      id: uid(),
      kind: "discussion",
      sectionId: input.sectionId,
      sectionTitle: input.sectionTitle,
      bookTitle: input.bookTitle,
      blockIndex: input.blockIndex,
      selectedText: input.selectedText,
      charStart: input.charStart,
      charEnd: input.charEnd,
      status: "open",
      createdAt: now,
      createdById: input.authorId,
      messages: [],
    };
    firstMessage.discussionId = discussion.id;
    discussion.messages.push(firstMessage);
    all.push(discussion);
    await save(all);
    return discussion;
  }

  async createHighlight(input: CreateHighlightInput): Promise<Discussion> {
    const all = await load();
    const discussion: Discussion = {
      id: uid(),
      kind: "highlight",
      sectionId: input.sectionId,
      sectionTitle: input.sectionTitle,
      bookTitle: input.bookTitle,
      blockIndex: input.blockIndex,
      selectedText: input.selectedText.slice(0, 300),
      charStart: input.charStart,
      charEnd: input.charEnd,
      status: "open",
      createdAt: Date.now(),
      createdById: input.authorId,
      messages: [],
    };
    all.push(discussion);
    await save(all);
    return discussion;
  }

  async removeHighlight(id: string, userId: string): Promise<void> {
    const all = await load();
    const item = all.find((d) => d.id === id);
    if (item && item.kind === "highlight" && item.createdById === userId) {
      await save(all.filter((d) => d.id !== id));
    }
  }

  async addMessage(input: AddMessageInput): Promise<Message | null> {
    const all = await load();
    const discussion = all.find((d) => d.id === input.discussionId);
    if (!discussion) return null;
    const message: Message = {
      id: uid(),
      discussionId: discussion.id,
      authorId: input.authorId,
      authorName: input.authorName,
      authorRole: input.authorRole,
      text: input.text,
      createdAt: Date.now(),
      parentMessageId: input.parentMessageId,
      likes: [],
    };
    discussion.messages.push(message);
    if (input.authorRole === "admin") discussion.hasAdminReply = true;
    await save(all);
    return message;
  }

  async editMessage(
    discussionId: string,
    messageId: string,
    text: string,
  ): Promise<void> {
    const all = await load();
    const discussion = all.find((d) => d.id === discussionId);
    const message = discussion?.messages.find((m) => m.id === messageId);
    if (message) {
      message.text = text;
      message.editedAt = Date.now();
      await save(all);
    }
  }

  async deleteMessage(
    discussionId: string,
    messageId: string,
  ): Promise<void> {
    const all = await load();
    const discussion = all.find((d) => d.id === discussionId);
    if (!discussion) return;
    discussion.messages = discussion.messages.filter((m) => m.id !== messageId);
    if (discussion.pinnedMessageId === messageId) {
      discussion.pinnedMessageId = undefined;
    }
    if (discussion.messages.length === 0) {
      await this.deleteDiscussion(discussionId);
      return;
    }
    await save(all);
  }

  async toggleLike(
    discussionId: string,
    messageId: string,
    userId: string,
  ): Promise<void> {
    const all = await load();
    const message = all
      .find((d) => d.id === discussionId)
      ?.messages.find((m) => m.id === messageId);
    if (!message) return;
    const idx = message.likes.indexOf(userId);
    if (idx === -1) message.likes.push(userId);
    else message.likes.splice(idx, 1);
    await save(all);
  }

  async resolve(discussionId: string, resolvedById: string): Promise<void> {
    const all = await load();
    const discussion = all.find((d) => d.id === discussionId);
    if (!discussion) return;
    discussion.status = "resolved";
    discussion.resolvedAt = Date.now();
    discussion.resolvedById = resolvedById;
    await save(all);
  }

  async reopen(discussionId: string, _actorId: string): Promise<void> {
    void _actorId;
    const all = await load();
    const discussion = all.find((d) => d.id === discussionId);
    if (!discussion) return;
    discussion.status = "open";
    discussion.resolvedAt = undefined;
    discussion.resolvedById = undefined;
    await save(all);
  }

  async pinMessage(discussionId: string, messageId: string): Promise<void> {
    const all = await load();
    const discussion = all.find((d) => d.id === discussionId);
    if (!discussion) return;
    discussion.pinnedMessageId = messageId;
    await save(all);
  }

  async unpinMessage(discussionId: string): Promise<void> {
    const all = await load();
    const discussion = all.find((d) => d.id === discussionId);
    if (!discussion) return;
    discussion.pinnedMessageId = undefined;
    await save(all);
  }

  async deleteDiscussion(discussionId: string): Promise<void> {
    const all = await load();
    await save(all.filter((d) => d.id !== discussionId));
  }

  async resolveMany(ids: string[], actorId: string): Promise<void> {
    const all = await load();
    const now = Date.now();
    for (const d of all) {
      if (ids.includes(d.id)) {
        d.status = "resolved";
        d.resolvedAt = now;
        d.resolvedById = actorId;
      }
    }
    await save(all);
  }

  async deleteMany(ids: string[]): Promise<void> {
    const all = await load();
    await save(all.filter((d) => !ids.includes(d.id)));
  }
}

export function createCommentRepository(): CommentRepository {
  return new LocalStorageCommentRepository();
}
