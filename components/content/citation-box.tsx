"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/data/site";

function buildCitation(title: string) {
  return `${siteConfig.author}، «${title}»، ${siteConfig.workTitle}، ${siteConfig.attributionPlace} ${siteConfig.attributionYear}.${siteConfig.doi ? `\n${siteConfig.doi}` : ""}`;
}

export function CitationBox({ title }: { title: string }) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildCitation(title));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }, [title]);

  return (
    <div className="rounded-xl border border-line bg-card px-5 py-4">
      <p className="mb-2 font-kufi text-xs font-medium text-ink-faint">
        اقتبس هذا الموضوع:
      </p>
      <p className="font-amiri text-sm leading-relaxed text-ink-soft">
        {siteConfig.author}، «{title}»، {siteConfig.workTitle}،{" "}
        {siteConfig.attributionPlace} {siteConfig.attributionYear}.
        {siteConfig.doi && (
          <>
            <br />
            <a
              href={siteConfig.doi}
              target="_blank"
              rel="noopener noreferrer"
              className="font-kufi text-[0.8rem] text-accent transition-colors hover:text-accent-bright"
            >
              {siteConfig.doi}
            </a>
          </>
        )}
      </p>
      <button
        type="button"
        onClick={onCopy}
        className={cn(
          "mt-3 inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 font-kufi text-xs transition-all hover:border-accent-bright hover:text-accent-bright",
          copied && "border-green-600 text-green-600",
        )}
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5" />
            تمّ النسخ
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            نسخ
          </>
        )}
      </button>
    </div>
  );
}
