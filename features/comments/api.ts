import type {
  PublicComment,
  PublicCommentFilter,
  PublicCommentPage,
} from "@/interfaces/types";
import { apiFetch } from "@/repositories/rest/client";

export interface SubmitPublicCommentInput {
  sectionId: string;
  sectionTitle: string;
  bookTitle: string;
  name: string;
  email?: string;
  text: string;
  hp_field?: string;
}

export interface SubmitPublicCommentResult {
  ok: true;
  id: string;
  status: "pending";
}

export type ModerationAction = "approve" | "reject" | "pending";

export function submitPublicComment(
  input: SubmitPublicCommentInput,
): Promise<SubmitPublicCommentResult> {
  return apiFetch<SubmitPublicCommentResult>("/api/comments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listApprovedPublicComments(
  sectionId: string,
): Promise<PublicComment[]> {
  return apiFetch<PublicComment[]>(
    `/api/comments?sectionId=${encodeURIComponent(sectionId)}`,
  );
}

export interface ListPublicCommentsQuery {
  status?: PublicCommentFilter;
  q?: string;
  page?: number;
  pageSize?: number;
}

export function listPublicComments(
  query: ListPublicCommentsQuery = {},
): Promise<PublicCommentPage> {
  const params = new URLSearchParams();
  params.set("status", query.status ?? "all");
  if (query.q?.trim()) params.set("q", query.q.trim());
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  return apiFetch<PublicCommentPage>(`/api/comments?${params.toString()}`, {
    cache: "no-store",
  });
}

export function moderatePublicComment(
  id: string,
  action: ModerationAction,
): Promise<PublicComment> {
  return apiFetch<PublicComment>(`/api/comments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ action }),
  });
}

export function replyToPublicComment(
  id: string,
  reply: string,
): Promise<PublicComment> {
  return apiFetch<PublicComment>(`/api/comments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "reply", reply }),
  });
}

export function removePublicCommentReply(id: string): Promise<PublicComment> {
  return apiFetch<PublicComment>(`/api/comments/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ action: "remove-reply" }),
  });
}

export async function deletePublicComment(id: string): Promise<void> {
  await apiFetch<{ ok: true }>(`/api/comments/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
