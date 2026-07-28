"use client";

import * as React from "react";
import { Link2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyLinkButton({
  anchor,
  className,
}: {
  anchor: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = React.useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const url = `${window.location.origin}${window.location.pathname}#${anchor}`;
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        /* clipboard unavailable */
      }
    },
    [anchor],
  );

  return (
    <button
      type="button"
      onClick={onCopy}
      aria-label="نسخ رابط القسم"
      title="نسخ الرابط"
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-faint opacity-0 transition-all hover:bg-paper-deep hover:text-accent group-hover:opacity-100 focus-visible:opacity-100",
        className,
      )}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-600" />
      ) : (
        <Link2 className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
