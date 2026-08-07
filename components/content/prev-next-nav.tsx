import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { FlatChapter } from "@/lib/content";

export function PrevNextNav({
  prev,
  next,
}: {
  prev?: FlatChapter;
  next?: FlatChapter;
}) {
  return (
    <nav
      aria-label="الانتقال بين الفصول"
      className="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`/${prev.bookNumber}/${prev.slug}`}
          className="group flex flex-col gap-1 rounded-xl border border-line bg-card p-4 transition-all hover:border-accent-bright hover:shadow-soft"
        >
          <span className="flex items-center gap-1.5 font-kufi text-xs text-ink-faint">
            <ArrowRight className="h-3.5 w-3.5" />
            الفصل السابق
          </span>
          <span className="line-clamp-2 font-kufi text-sm font-medium text-ink group-hover:text-accent">
            {prev.title}
          </span>
          <span className="font-kufi text-[0.7rem] text-ink-faint">
            {prev.bookTitle}
          </span>
        </Link>
      ) : (
        <span className="hidden sm:block" />
      )}
      {next ? (
        <Link
          href={`/${next.bookNumber}/${next.slug}`}
          className="group flex flex-col gap-1 rounded-xl border border-line bg-card p-4 text-left transition-all hover:border-accent-bright hover:shadow-soft sm:text-right"
        >
          <span className="flex items-center justify-end gap-1.5 font-kufi text-xs text-ink-faint sm:justify-start">
            الفصل التالي
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
          <span className="line-clamp-2 font-kufi text-sm font-medium text-ink group-hover:text-accent">
            {next.title}
          </span>
          <span className="font-kufi text-[0.7rem] text-ink-faint">
            {next.bookTitle}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
