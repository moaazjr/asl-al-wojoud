import Link from "next/link";
import { ArrowUpLeft, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChapterJumpLink({
  href,
  quote,
  label,
  className,
}: {
  href: string;
  quote: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group my-8 flex items-start gap-3 rounded-xl border border-accent/20 bg-accent-soft/30 p-4 transition-colors hover:border-accent/45 hover:bg-accent-soft/50",
        className,
      )}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-paper text-accent">
        <Quote className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-kufi text-[0.68rem] font-semibold text-accent">
          {label}
        </span>
        <span className="mt-1 block font-amiri text-base leading-relaxed text-ink">
          «{quote}»
        </span>
      </span>
      <ArrowUpLeft
        className="mt-1 h-4 w-4 shrink-0 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:-translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
