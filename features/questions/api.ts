import type { Question } from "@/interfaces/types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error(
      (body as { error?: string }).error ?? "تعذّر تنفيذ الطلب.",
    );
  return body as T;
}

export function listQuestions(): Promise<Question[]> {
  return request<Question[]>("/api/questions");
}

export function updateQuestion(
  id: string,
  isRead: boolean,
): Promise<Question> {
  return request<Question>(`/api/questions/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isRead }),
  });
}

export async function deleteQuestion(id: string): Promise<void> {
  await request<{ ok: true }>(`/api/questions/${id}`, { method: "DELETE" });
}
