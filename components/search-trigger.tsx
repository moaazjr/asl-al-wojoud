"use client";

import { Search } from "lucide-react";
import { useSearch } from "@/features/search/search-provider";

export function SearchTrigger() {
  const { setOpen } = useSearch();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label="بحث"
      className="flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5 font-kufi text-sm text-ink-faint transition-colors hover:border-accent-bright hover:text-ink"
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">بحث</span>
      <kbd className="hidden rounded border border-line bg-paper-deep px-1.5 py-0.5 text-[0.65rem] text-ink-faint md:inline">
        Ctrl K
      </kbd>
    </button>
  );
}
