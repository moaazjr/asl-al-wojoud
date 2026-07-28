import type {
  AddMessageInput,
  CommentRepository,
  CreateDiscussionInput,
  CreateHighlightInput,
} from "@/interfaces/CommentRepository";
import type {
  Discussion,
  DiscussionFilter,
  Message,
} from "@/interfaces/types";
import { apiFetch } from "./client";

function filterToQuery(filter?: DiscussionFilter): string {
  if (!filter) return "";
  const params = new URLSearchParams();
  if (filter.status) params.set("status", filter.status);
  if (filter.search) params.set("search", filter.search);
  if (filter.sectionId) params.set("sectionId", filter.sectionId);
  const s = params.toString();
  return s ? `?${s}` : "";
}

export class RestCommentRepository implements CommentRepository {
  async getDiscussionsBySection(sectionId: string): Promise<Discussion[]> {
    return apiFetch<Discussion[]>(
      `/api/discussions?sectionId=${encodeURIComponent(sectionId)}`,
    );
  }

  async getDiscussion(id: string): Promise<Discussion | null> {
    return apiFetch<Discussion | null>(`/api/discussions/${id}`);
  }

  async getDiscussionsForUser(_userId: string): Promise<Discussion[]> {
    return apiFetch<Discussion[]>(`/api/discussions?mine=1`);
  }

  async getAllDiscussions(filter?: DiscussionFilter): Promise<Discussion[]> {
    return apiFetch<Discussion[]>(`/api/discussions${filterToQuery(filter)}`);
  }

  async createDiscussion(input: CreateDiscussionInput): Promise<Discussion> {
    return apiFetch<Discussion>("/api/discussions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async createHighlight(input: CreateHighlightInput): Promise<Discussion> {
    return apiFetch<Discussion>("/api/discussions", {
      method: "POST",
      body: JSON.stringify({ ...input, kind: "highlight" }),
    });
  }

  async removeHighlight(id: string, _userId: string): Promise<void> {
    await apiFetch<{ ok: true }>(
      `/api/discussions/${id}?mode=highlight`,
      { method: "DELETE" },
    );
  }

  async addMessage(input: AddMessageInput): Promise<Message | null> {
    return apiFetch<Message | null>(
      `/api/discussions/${input.discussionId}/messages`,
      { method: "POST", body: JSON.stringify(input) },
    );
  }

  async editMessage(
    discussionId: string,
    messageId: string,
    text: string,
  ): Promise<void> {
    await apiFetch<{ ok: true }>(
      `/api/discussions/${discussionId}/messages/${messageId}`,
      { method: "PATCH", body: JSON.stringify({ text }) },
    );
  }

  async deleteMessage(
    discussionId: string,
    messageId: string,
  ): Promise<void> {
    await apiFetch<{ ok: true }>(
      `/api/discussions/${discussionId}/messages/${messageId}`,
      { method: "DELETE" },
    );
  }

  async toggleLike(
    discussionId: string,
    messageId: string,
    _userId: string,
  ): Promise<void> {
    await apiFetch<{ ok: true }>(
      `/api/discussions/${discussionId}/messages/${messageId}/like`,
      { method: "POST" },
    );
  }

  async resolve(discussionId: string, _resolvedById: string): Promise<void> {
    await apiFetch<{ ok: true }>(
      `/api/discussions/${discussionId}/resolve`,
      { method: "POST" },
    );
  }

  async reopen(discussionId: string, _actorId: string): Promise<void> {
    await apiFetch<{ ok: true }>(
      `/api/discussions/${discussionId}/reopen`,
      { method: "POST" },
    );
  }

  async pinMessage(discussionId: string, messageId: string): Promise<void> {
    await apiFetch<{ ok: true }>(
      `/api/discussions/${discussionId}/pin`,
      { method: "POST", body: JSON.stringify({ messageId }) },
    );
  }

  async unpinMessage(discussionId: string): Promise<void> {
    await apiFetch<{ ok: true }>(
      `/api/discussions/${discussionId}/pin`,
      { method: "DELETE" },
    );
  }

  async deleteDiscussion(discussionId: string): Promise<void> {
    await apiFetch<{ ok: true }>(`/api/discussions/${discussionId}`, {
      method: "DELETE",
    });
  }

  async resolveMany(ids: string[], _actorId: string): Promise<void> {
    await apiFetch<{ ok: true }>("/api/discussions/batch", {
      method: "POST",
      body: JSON.stringify({ action: "resolve", ids }),
    });
  }

  async deleteMany(ids: string[]): Promise<void> {
    await apiFetch<{ ok: true }>("/api/discussions/batch", {
      method: "POST",
      body: JSON.stringify({ action: "delete", ids }),
    });
  }
}
