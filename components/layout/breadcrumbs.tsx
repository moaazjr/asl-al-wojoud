import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { siteConfig } from "@/data/site";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: siteConfig.shortName, href: "/" }, ...items];
  return (
    <nav aria-label="مسار التنقل" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 font-kufi text-xs text-ink-faint">
        {all.map((item, i) => {
          const isLast = i === all.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-accent"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-ink-soft" : ""}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronLeft className="h-3 w-3 opacity-50" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
