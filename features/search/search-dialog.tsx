"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, FileText, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { buildSearchRegex, extractSnippet } from "@/lib/arabic";
import { useSearchIndex } from "./use-search";
import type { SearchDoc } from "./types";

function Highlight({ text, query }: { text: string; query: string }) {
  const regex = React.useMemo(() => buildSearchRegex(query), [query]);
  if (!query.trim()) return <>{text}</>;
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let key = 0;
  for (const m of text.matchAll(regex)) {
    if (m.index !== undefined && m.index > lastIdx)
      parts.push(text.slice(lastIdx, m.index));
    parts.push(
      <mark key={key++} className="rounded bg-accent-soft px-0.5 text-accent">
        {m[0]}
      </mark>,
    );
    lastIdx = (m.index ?? 0) + m[0].length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return <>{parts}</>;
}

function ResultRow({
  doc,
  query,
  active,
  onClick,
}: {
  doc: SearchDoc;
  query: string;
  active: boolean;
  onClick: () => void;
}) {
  const snippet = React.useMemo(
    () => extractSnippet(doc.c || doc.d, query),
    [doc.c, doc.d, query],
  );
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full flex-col gap-1 border-b border-line-soft px-4 py-3 text-start transition-colors",
        active ? "bg-accent-soft" : "hover:bg-paper-deep",
      )}
    >
      <div className="flex items-center gap-2">
        <FileText
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            active ? "text-accent" : "text-ink-faint",
          )}
        />
        <span
          className={cn(
            "font-kufi text-sm leading-snug",
            active ? "font-semibold text-accent" : "text-ink",
          )}
        >
          <Highlight text={doc.t} query={query} />
        </span>
        <span className="ms-auto shrink-0 rounded bg-paper-deep px-1.5 py-0.5 font-kufi text-[0.65rem] text-ink-faint">
          {doc.n}
        </span>
      </div>
      <div className="flex items-center gap-1.5 ps-6">
        <BookOpen className="h-3 w-3 shrink-0 text-ink-faint" />
        <span className="truncate font-kufi text-[0.72rem] text-ink-faint">
          {doc.bt}
        </span>
      </div>
      {snippet && (
        <p className="ps-6 font-naskh text-[0.82rem] leading-relaxed text-ink-soft">
          <Highlight text={snippet} query={query} />
        </p>
      )}
    </button>
  );
}

export function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const { ready, loading, ensureLoaded, search } = useSearchIndex();
  const [query, setQuery] = React.useState("");
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [prevOpen, setPrevOpen] = React.useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setActiveIndex(0);
      if (!ready && !loading) void ensureLoaded();
    }
  }

  const [prevQuery, setPrevQuery] = React.useState("");
  if (query !== prevQuery) {
    setPrevQuery(query);
    setActiveIndex(0);
  }

  const results = React.useMemo(() => {
    if (!ready || !query.trim()) return [];
    return search(query, 10);
  }, [ready, query, search]);

  const navigate = React.useCallback(
    (doc: SearchDoc) => {
      onOpenChange(false);
      router.push(`/${doc.bn}/${doc.s}`);
    },
    [onOpenChange, router],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      navigate(results[activeIndex]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0">
        <DialogTitle className="sr-only">البحث في الكتاب</DialogTitle>
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-ink-faint" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ابحث في الكتاب…"
            aria-label="ابحث في الكتاب"
            autoComplete="off"
            className="h-8 flex-1 bg-transparent font-kufi text-sm text-ink placeholder:text-ink-faint focus:outline-none"
          />
          {loading && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-ink-faint" />
          )}
          {query && !loading && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="مسح البحث"
              className="rounded p-1 text-ink-faint transition-colors hover:bg-paper-deep hover:text-ink"
            >
              ×
            </button>
          )}
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {ready && query.trim() && results.length === 0 && (
            <div className="px-4 py-10 text-center">
              <p className="font-kufi text-sm text-ink-faint">
                لا توجد نتائج مطابقة لـ «{query}»
              </p>
            </div>
          )}
          {ready && !query.trim() && (
            <div className="px-4 py-10 text-center">
              <p className="font-kufi text-sm text-ink-faint">
                اكتب كلمة للبحث في ٦٨٦ قسمًا من الكتاب
              </p>
            </div>
          )}
          {results.length > 0 && (
            <div role="listbox" aria-label="نتائج البحث">
              {results.map((doc, i) => (
                <div
                  key={doc.i}
                  ref={(el) => {
                    if (el && i === activeIndex) {
                      el.scrollIntoView({ block: "nearest" });
                    }
                  }}
                >
                  <ResultRow
                    doc={doc}
                    query={query}
                    active={i === activeIndex}
                    onClick={() => navigate(doc)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line px-4 py-2">
          <div className="flex items-center gap-3 font-kufi text-[0.7rem] text-ink-faint">
            <span>
              <kbd className="rounded border border-line bg-paper-deep px-1 py-0.5">
                ↑↓
              </kbd>{" "}
              تنقّل
            </span>
            <span>
              <kbd className="rounded border border-line bg-paper-deep px-1 py-0.5">
                ↵
              </kbd>{" "}
              انتقال
            </span>
            <span>
              <kbd className="rounded border border-line bg-paper-deep px-1 py-0.5">
                esc
              </kbd>{" "}
              إغلاق
            </span>
          </div>
          {results.length > 0 && (
            <span className="font-kufi text-[0.7rem] text-ink-faint">
              {results.length} نتيجة
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
