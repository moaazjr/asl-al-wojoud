import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { TocSection } from "@/types/content";
import { sectionRoute } from "@/lib/route";
import { cn } from "@/lib/utils";

export function SectionList({
  sections,
  bookNumber,
  anchor = false,
}: {
  sections: TocSection[];
  bookNumber: number;
  anchor?: boolean;
}) {
  return (
    <ul className="divide-y divide-line-soft">
      {sections.map((section) => (
          <li key={section.num} id={anchor ? section.slug : undefined}>
            <Link
              href={sectionRoute(bookNumber, section.num, section.slug)}
              className={cn(
                "group flex items-start gap-3 py-4 transition-colors hover:bg-paper-deep/50",
                anchor && "scroll-mt-24 md:scroll-mt-28",
              )}
            >
            <span className="mt-0.5 shrink-0 font-kufi text-xs font-semibold text-accent-bright">
              {section.num}
            </span>
            <div className="min-w-0 flex-1">
              <span className="block font-kufi text-base font-medium text-ink transition-colors group-hover:text-accent">
                {section.title}
              </span>
              {section.desc && (
                <span className="mt-1 block text-sm leading-relaxed text-ink-soft line-clamp-2">
                  {section.desc}
                </span>
              )}
              {section.children.length > 0 && (
                <span className="mt-1 block font-kufi text-xs text-ink-faint">
                  {section.children.length} مبحثاً فرعياً
                </span>
              )}
            </div>
            <ArrowLeft className="mt-1 h-4 w-4 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
          {section.children.length > 0 && (
            <ul className="divide-y divide-line-soft/60 ps-7">
              {section.children.slice(0, 8).map((child) => (
                <li key={child.num}>
                  <Link
                    href={sectionRoute(bookNumber, child.num, child.slug)}
                    className="group flex items-center gap-3 py-2.5 transition-colors hover:text-accent"
                  >
                    <span className="shrink-0 font-kufi text-xs text-ink-faint">
                      {child.num}
                    </span>
                    <span className="truncate text-sm text-ink-soft group-hover:text-accent">
                      {child.title}
                    </span>
                  </Link>
                </li>
              ))}
              {section.children.length > 8 && (
                <li className="py-2.5">
                  <Link
                    href={`/${bookNumber}/${section.slug}`}
                    className="font-kufi text-xs text-accent hover:underline"
                  >
                    + {section.children.length - 8} مبحثاً آخر
                  </Link>
                </li>
              )}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}