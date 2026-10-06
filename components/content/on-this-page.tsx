"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ListTree } from "lucide-react";
import type { OutlineBook, OutlineNode } from "@/lib/content";
import { sectionRoute } from "@/lib/route";
import { cn } from "@/lib/utils";

export interface OnThisPageItem {
  id: string;
  href: string;
  num: string;
  title: string;
  level: number;
}

function findTarget(
  children: OutlineNode[],
  slug: string,
): OutlineNode | null {
  for (const child of children) {
    if (child.slug === slug) return child;
    const deeper = findTarget(child.children, slug);
    if (deeper) return deeper;
  }
  return null;
}

function flattenDescendants(node: OutlineNode): OutlineNode[] {
  const out: OutlineNode[] = [];
  for (const child of node.children) {
    out.push(child);
    out.push(...flattenDescendants(child));
  }
  return out;
}

function toItems(
  nodes: OutlineNode[],
  bookNumber: number,
): OnThisPageItem[] {
  return nodes.map((n) => ({
    id: n.slug,
    href: sectionRoute(bookNumber, n.num, n.slug),
    num: n.num,
    title: n.title,
    level: n.level,
  }));
}

// Distance from the top of the viewport to the reading line.
// Accounts for the sticky navbar (top-16 = 4rem) plus breathing room so the
// first heading just below it is the one we treat as "current".
const READING_OFFSET = 120;

// How far from the reading line an element must be to be considered a match.
// Anything below the line remains "inactive"; only elements at/above it compete.
const SECTION_TOLERANCE = 96;

function pickActive(items: OnThisPageItem[], pathname: string): string | null {
  const reached: { item: OnThisPageItem; dist: number }[] = [];

  for (const item of items) {
    const el = document.getElementById(item.id);
    if (!el) continue;
    const top = el.getBoundingClientRect().top;

    // Ignore sections that are still below the reading line, unless none has
    // reached it yet (e.g. the page is scrolled to the very top).
    if (top <= READING_OFFSET + SECTION_TOLERANCE) {
      reached.push({ item, dist: Math.max(0, top - READING_OFFSET) });
    }
  }

  if (reached.length === 0) {
    return items.find((i) => i.href === pathname)?.id ?? null;
  }

  // The active section is the one whose top edge is closest to (and above) the
  // reading line. This works for both directions of scrolling and avoids the
  // previous section incorrectly staying active.
  reached.sort((a, b) => a.dist - b.dist);
  return reached[0].item.id;
}

export function useOnThisPage(books: OutlineBook[]) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const items = React.useMemo<OnThisPageItem[]>(() => {
    const parts = pathname.split("/").filter(Boolean);
    const bookNum = parts[0] ? Number(parts[0]) : NaN;
    const slug = parts[1];
    const book = books.find((b) => b.number === bookNum);
    if (!book) return [];

    if (!slug) return toItems(book.children, book.number);

    const chapter = findTarget(book.children, slug);
    if (!chapter) return [];

    return toItems(flattenDescendants(chapter), book.number);
  }, [books, pathname]);

  // The item the user just clicked. The scroll observer defers to it while the
  // smooth scroll is settling, so it never gets overridden by the previous
  // section mid-animation.
  const pendingRef = React.useRef<string | null>(null);
  const pendingTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyPending = React.useCallback((id: string) => {
    pendingRef.current = id;
    setActiveId(id);
    if (pendingTimer.current) clearTimeout(pendingTimer.current);
    pendingTimer.current = setTimeout(() => {
      pendingRef.current = null;
    }, 700);
  }, []);

  React.useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;

      const els = items
        .map((item) => document.getElementById(item.id))
        .filter((el): el is HTMLElement => el !== null);

      if (els.length === 0) {
        setActiveId(items.find((i) => i.href === pathname)?.id ?? null);
        return;
      }

      // Right after a click, keep the clicked item highlighted until the
      // smooth scroll settles instead of letting the previous section win.
      if (pendingRef.current) {
        setActiveId(pendingRef.current);
        return;
      }

      setActiveId(pickActive(items, pathname));
    };
    const schedule = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [items, pathname]);

  React.useEffect(
    () => () => {
      if (pendingTimer.current) clearTimeout(pendingTimer.current);
    },
    [],
  );

  const handleClick = React.useCallback(
    (item: OnThisPageItem) => {
      applyPending(item.id);
      const el = document.getElementById(item.id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        router.push(item.href);
      }
    },
    [router, applyPending],
  );

  return { items, activeId, handleClick };
}

export function OnThisPageNav({
  items,
  activeId,
  onNavigate,
}: {
  items: OnThisPageItem[];
  activeId: string | null;
  onNavigate: (item: OnThisPageItem) => void;
}) {
  return (
    <nav aria-label="محتويات الصفحة" className="space-y-0.5">
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <a
            key={item.id}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(item);
            }}
            style={{
              paddingInlineStart: `${Math.max(0, item.level - 2) * 0.75}rem`,
            }}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "flex items-baseline gap-1.5 rounded-md py-1 font-kufi text-[0.8rem] leading-snug transition-colors",
              isActive
                ? "font-semibold text-accent"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {item.level > 2 && <span className="sr-only">·</span>}
            {isActive ? (
              <span className="h-1 w-1 shrink-0 translate-y-[-2px] rounded-full bg-accent" />
            ) : null}
            <span className="truncate">{item.title}</span>
          </a>
        );
      })}
    </nav>
  );
}

export function OnThisPage({ books }: { books: OutlineBook[] }) {
  const { items, activeId, handleClick } = useOnThisPage(books);

  if (items.length === 0) return null;

  return (
    <aside className="hidden w-64 shrink-0 xl:block">
      <div className="sticky top-16 max-h-[calc(100dvh-5rem)] overflow-y-auto ps-6 py-10">
        <h2 className="mb-3 flex items-center gap-1.5 font-kufi text-xs font-semibold uppercase tracking-wide text-ink-faint">
          <ListTree className="h-3.5 w-3.5 text-accent" />
          على هذه الصفحة
        </h2>
        <OnThisPageNav
          items={items}
          activeId={activeId}
          onNavigate={handleClick}
        />
      </div>
    </aside>
  );
}