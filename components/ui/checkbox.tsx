"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, checked, ...props }, ref) => (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <span className="relative inline-flex h-[18px] w-[18px] items-center justify-center">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          className="peer sr-only"
          {...props}
        />
        <span
          className={cn(
            "flex h-[18px] w-[18px] items-center justify-center rounded-md border border-line bg-card transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-checked:border-accent peer-checked:bg-accent",
            className,
          )}
        >
          {checked && <Check className="h-3 w-3 text-paper" strokeWidth={3} />}
        </span>
      </span>
      {label && (
        <span className="font-kufi text-sm text-ink-soft">{label}</span>
      )}
    </label>
  ),
);
Checkbox.displayName = "Checkbox";
