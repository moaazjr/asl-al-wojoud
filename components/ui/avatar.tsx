"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
  isAdmin?: boolean;
}

function initial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "؟";
  return trimmed.charAt(0).toUpperCase();
}

const palette = [
  "bg-accent/15 text-accent",
  "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  "bg-sky-500/15 text-sky-700 dark:text-sky-400",
  "bg-rose-500/15 text-rose-700 dark:text-rose-400",
  "bg-violet-500/15 text-violet-700 dark:text-violet-400",
];

export function Avatar({ name, isAdmin, className, ...props }: AvatarProps) {
  const color = React.useMemo(() => {
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return palette[sum % palette.length];
  }, [name]);

  if (isAdmin) {
    return (
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent font-kufi text-sm font-bold text-paper ring-2 ring-accent/30",
          className,
        )}
        {...props}
      >
        {initial(name)}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-kufi text-sm font-bold",
        color,
        className,
      )}
      {...props}
    >
      {initial(name)}
    </span>
  );
}
