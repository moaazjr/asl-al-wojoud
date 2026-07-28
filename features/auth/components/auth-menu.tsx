"use client";

import * as React from "react";
import Link from "next/link";
import {
  LogIn,
  LogOut,
  LayoutDashboard,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "../use-auth";

export function AuthMenu() {
  const { user, loading, isAuthenticated, setAuthDialogOpen, logout } =
    useAuth();

  if (loading) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  if (!isAuthenticated) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setAuthDialogOpen(true)}
      >
        <LogIn className="h-4 w-4" />
        دخول
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-full border border-transparent p-0.5 pe-2 transition-colors hover:border-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <Avatar name={user!.name} isAdmin={user!.role === "admin"} className="h-8 w-8 text-xs" />
          <span className="hidden max-w-[8rem] truncate font-kufi text-sm font-medium text-ink sm:block">
            {user!.name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-ink-faint" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="truncate">{user!.name}</span>
          {user!.role === "admin" ? (
            <Badge variant="admin">مشرف</Badge>
          ) : (
            <Badge variant="muted">عضو</Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {user!.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              لوحة التحكم
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link href="/my-discussions">
            <LayoutDashboard className="h-4 w-4" />
            نقاشاتي
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="danger" onClick={() => void logout()}>
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
