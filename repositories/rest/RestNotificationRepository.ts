import type {
  CreateNotificationInput,
  NotificationRepository,
} from "@/interfaces/NotificationRepository";
import type { AppNotification } from "@/interfaces/types";
import { apiFetch } from "./client";

const NOOP_NOTIFICATION = {
  id: "",
  userId: "",
  type: "admin-reply",
  discussionId: "",
  sectionId: "",
  sectionTitle: "",
  text: "",
  read: false,
  createdAt: 0,
} as const satisfies AppNotification;

export class RestNotificationRepository implements NotificationRepository {
  async getAll(_userId: string): Promise<AppNotification[]> {
    return apiFetch<AppNotification[]>("/api/notifications");
  }

  async getUnreadCount(_userId: string): Promise<number> {
    const body = await apiFetch<{ count: number }>(
      "/api/notifications/unread-count",
    );
    return body.count;
  }

  async create(_input: CreateNotificationInput): Promise<AppNotification> {
    return NOOP_NOTIFICATION;
  }

  async markRead(id: string): Promise<void> {
    await apiFetch<{ ok: true }>(`/api/notifications/${id}/read`, {
      method: "POST",
    });
  }

  async markAllRead(_userId: string): Promise<void> {
    await apiFetch<{ ok: true }>("/api/notifications/read-all", {
      method: "POST",
    });
  }

  async clear(_userId: string): Promise<void> {
    await apiFetch<{ ok: true }>("/api/notifications", { method: "DELETE" });
  }
}
