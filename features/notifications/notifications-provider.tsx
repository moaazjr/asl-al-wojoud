"use client";

import * as React from "react";
import type { AppNotification } from "@/interfaces/types";
import { getNotificationService } from "@/services/container";
import { useAuth } from "@/features/auth/use-auth";

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  refresh: () => void;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
}

export const NotificationsContext = React.createContext<NotificationsContextValue>({
  notifications: [],
  unreadCount: 0,
  refresh: () => {},
  markRead: async () => {},
  markAllRead: async () => {},
});

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [notifications, setNotifications] = React.useState<AppNotification[]>(
    [],
  );
  const [unreadCount, setUnreadCount] = React.useState(0);

  const refresh = React.useCallback(() => {
    const u = user;
    if (!u) return;
    const svc = getNotificationService();
    svc.list(u.id).then(setNotifications).catch(() => void 0);
    svc.unreadCount(u.id).then(setUnreadCount).catch(() => void 0);
  }, [user]);

  React.useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  React.useEffect(() => {
    if (!user) return;
    const onFocus = () => refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("aa:")) refresh();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    const interval = window.setInterval(refresh, 20_000);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.clearInterval(interval);
    };
  }, [user, refresh]);

  const markRead = React.useCallback(
    async (id: string) => {
      await getNotificationService().markRead(id);
      refresh();
    },
    [refresh],
  );

  const markAllRead = React.useCallback(async () => {
    if (!user) return;
    await getNotificationService().markAllRead(user.id);
    refresh();
  }, [user, refresh]);

  const value = React.useMemo(
    () => ({
      notifications: user ? notifications : [],
      unreadCount: user ? unreadCount : 0,
      refresh,
      markRead,
      markAllRead,
    }),
    [user, notifications, unreadCount, refresh, markRead, markAllRead],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}
