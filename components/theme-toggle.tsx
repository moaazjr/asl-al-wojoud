"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
      title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun className="hidden h-[1.15rem] w-[1.15rem] dark:block" />
      <Moon className="block h-[1.15rem] w-[1.15rem] dark:hidden" />
    </Button>
  );
}
