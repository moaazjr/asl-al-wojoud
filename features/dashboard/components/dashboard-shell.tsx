"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessagesSquare,
  CircleDot,
  CheckCircle2,
  Clock,
  Users,
  Settings,
  ShieldAlert,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/use-auth";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const NAV = [
  { href: "/dashboard", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/dashboard/discussions", label: "كل النقاشات", icon: MessagesSquare },
  { href: "/dashboard/open", label: "النقاشات المفتوحة", icon: CircleDot },
  { href: "/dashboard/resolved", label: "النقاشات المغلقة", icon: CheckCircle2 },
  { href: "/dashboard/recent", label: "أحدث التعليقات", icon: Clock },
  { href: "/dashboard/users", label: "المستخدمون", icon: Users },
  { href: "/dashboard/settings", label: "الإعدادات", icon: Settings },
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, isAuthenticated } = useAuth();
  const isAdmin = user?.role === "admin";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10">
          <ShieldAlert className="h-7 w-7 text-rose-600 dark:text-rose-400" />
        </span>
        <h1 className="font-kufi text-xl font-bold text-ink">
          صفحة مخصّصة للمشرفين
        </h1>
        <p className="font-kufi text-sm text-ink-faint">
          لا تملك صلاحية الوصول إلى لوحة التحكم.
        </p>
        <Link
          href="/"
          className="rounded-lg bg-accent px-4 py-2 font-kufi text-sm font-medium text-paper hover:bg-accent-bright"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-line bg-card p-3">
            <Avatar name={user!.name} isAdmin className="h-9 w-9" />
            <div className="min-w-0">
              <p className="truncate font-kufi text-sm font-semibold text-ink">
                {user!.name}
              </p>
              <Badge variant="admin" className="mt-0.5">مشرف</Badge>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {NAV.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 font-kufi text-sm transition-colors",
                    active
                      ? "bg-accent-soft font-semibold text-accent"
                      : "text-ink-soft hover:bg-paper-deep hover:text-ink",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/"
              className="mt-2 inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 font-kufi text-sm text-ink-faint transition-colors hover:text-ink"
            >
              <ExternalLink className="h-4 w-4" />
              العودة للكتاب
            </Link>
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
