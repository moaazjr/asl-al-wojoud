import type { CreateNotificationInput, NotificationRepository } from "@/interfaces/NotificationRepository";
import type { AppNotification } from "@/interfaces/types";

export class NotificationService {
  constructor(private readonly repo: NotificationRepository) {}

  list(userId: string): Promise<AppNotification[]> {
    return this.repo.getAll(userId);
  }

  unreadCount(userId: string): Promise<number> {
    return this.repo.getUnreadCount(userId);
  }

  notify(input: CreateNotificationInput): Promise<AppNotification> {
    return this.repo.create(input);
  }

  markRead(id: string): Promise<void> {
    return this.repo.markRead(id);
  }

  markAllRead(userId: string): Promise<void> {
    return this.repo.markAllRead(userId);
  }

  clear(userId: string): Promise<void> {
    return this.repo.clear(userId);
  }
}
