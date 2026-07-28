import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { FlatSection } from "@/types/content";

export function PrevNextNav({
  prev,
  next,
}: {
  prev?: FlatSection;
  next?: FlatSection;
}) {
  return (
    <nav
      aria-label="الانتقال بين المباحث"
      className="mt-16 grid gap-4 border-t border-line pt-8 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`/${prev.bookNumber}/${prev.slug}`}
          className="group flex flex-col gap-1 rounded-xl border border-line bg-card p-4 transition-all hover:border-accent-bright hover:shadow-soft"
        >
          <span className="flex items-center gap-1.5 font-kufi text-xs text-ink-faint">
            <ArrowRight className="h-3.5 w-3.5" />
            السابق
          </span>
          <span className="line-clamp-2 font-kufi text-sm font-medium text-ink group-hover:text-accent">
            {prev.title}
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
            التالي
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
          <span className="line-clamp-2 font-kufi text-sm font-medium text-ink group-hover:text-accent">
            {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
