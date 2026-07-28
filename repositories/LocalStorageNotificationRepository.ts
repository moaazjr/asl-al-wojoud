import type {
  CreateNotificationInput,
  NotificationRepository,
} from "@/interfaces/NotificationRepository";
import type { AppNotification } from "@/interfaces/types";
import { readJSON, STORAGE_KEYS, uid, writeJSON } from "./storage";

async function load(): Promise<AppNotification[]> {
  return readJSON<AppNotification[]>(STORAGE_KEYS.notifications, []);
}

async function save(items: AppNotification[]): Promise<void> {
  writeJSON(STORAGE_KEYS.notifications, items);
}

export class LocalStorageNotificationRepository implements NotificationRepository {
  async getAll(userId: string): Promise<AppNotification[]> {
    const all = await load();
    return all
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const all = await load();
    return all.filter((n) => n.userId === userId && !n.read).length;
  }

  async create(input: CreateNotificationInput): Promise<AppNotification> {
    const all = await load();
    const notification: AppNotification = {
      id: uid(),
      userId: input.userId,
      type: input.type,
      discussionId: input.discussionId,
      sectionId: input.sectionId,
      sectionTitle: input.sectionTitle,
      text: input.text,
      read: false,
      createdAt: Date.now(),
    };
    all.push(notification);
    await save(all);
    return notification;
  }

  async markRead(id: string): Promise<void> {
    const all = await load();
    const item = all.find((n) => n.id === id);
    if (item) {
      item.read = true;
      await save(all);
    }
  }

  async markAllRead(userId: string): Promise<void> {
    const all = await load();
    for (const n of all) {
      if (n.userId === userId) n.read = true;
    }
    await save(all);
  }

  async clear(userId: string): Promise<void> {
    const all = await load();
    await save(all.filter((n) => n.userId !== userId));
  }
}

export function createNotificationRepository(): NotificationRepository {
  return new LocalStorageNotificationRepository();
}
