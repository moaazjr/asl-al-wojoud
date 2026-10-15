import type { CommentModerationStatus, PublicComment } from "@/interfaces/types";
import { apiFetch } from "@/repositories/rest/client";

export interface SubmitPublicCommentInput {
  sectionId: string;
  sectionTitle: string;
  bookTitle: string;
  name: string;
  email?: string;
  text: string;
  website?: string;
}

export interface SubmitPublicCommentResult {
  ok: true;
  id: string;
  status: "pending";
}

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

export function listPublicComments(
  status?: CommentModerationStatus,
): Promise<PublicComment[]> {
  const query = status ? `?status=${status}` : "";
  return apiFetch<PublicComment[]>(`/api/comments${query}`);
}

export function moderatePublicComment(
  id: string,
  action: "approve" | "reject",
): Promise<PublicComment> {
  return apiFetch<PublicComment>(`/api/comments/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ action }),
  });
}

export async function deletePublicComment(id: string): Promise<void> {
  await apiFetch<{ ok: true }>(`/api/comments/${id}`, { method: "DELETE" });
}
