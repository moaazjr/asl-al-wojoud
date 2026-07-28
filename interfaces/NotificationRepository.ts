import type { AppNotification, NotificationType } from "./types";

export interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  discussionId: string;
  sectionId: string;
  sectionTitle: string;
  text: string;
}

export interface NotificationRepository {
  getAll(userId: string): Promise<AppNotification[]>;
  getUnreadCount(userId: string): Promise<number>;
  create(input: CreateNotificationInput): Promise<AppNotification>;
  markRead(id: string): Promise<void>;
  markAllRead(userId: string): Promise<void>;
  clear(userId: string): Promise<void>;
}
