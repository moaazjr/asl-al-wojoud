"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, BellRing, CheckCheck, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatRelativeTime } from "@/lib/format";
import { useNotifications } from "../use-notifications";
import { useAuth } from "@/features/auth/use-auth";

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications();

  if (!isAuthenticated) return null;

  const hasUnread = unreadCount > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {hasUnread ? (
            <BellRing className="h-[1.15rem] w-[1.15rem] text-accent" />
          ) : (
            <Bell className="h-[1.15rem] w-[1.15rem]" />
          )}
          {hasUnread && (
            <span className="absolute -top-0.5 end-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-kufi text-[0.6rem] font-bold text-paper">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>الإشعارات</span>
          {hasUnread && (
            <button
              onClick={() => void markAllRead()}
              className="inline-flex items-center gap-1 font-kufi text-xs font-medium text-accent hover:underline"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              تعليم الكل كمقروء
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
            <CircleDot className="h-5 w-5 text-ink-faint" />
            <p className="font-kufi text-sm text-ink-faint">لا توجد إشعارات</p>
          </div>
        ) : (
          notifications.slice(0, 12).map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex-col items-start gap-1 py-2.5"
              onClick={() => void markRead(n.id)}
              asChild
            >
              <Link href={`/${n.sectionId}`}>
                <div className="flex w-full items-start gap-2">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${n.read ? "bg-line" : "bg-accent"}`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 font-kufi text-xs leading-relaxed text-ink-soft">
                      {n.text}
                    </p>
                    <span className="font-kufi text-[0.65rem] text-ink-faint">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>
                </div>
              </Link>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
