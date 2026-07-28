"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Search, X } from "lucide-react";
import type { NavBook, NavNode } from "@/lib/content";
import { cn } from "@/lib/utils";

function useActiveRoute() {
  const pathname = usePathname();
  return React.useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const book = parts[0] ? parseInt(parts[0], 10) : NaN;
    const slug = parts[1];
    const activeNum = slug ? slug.replace(/-/g, ".") : "";
    const ancestorNums = new Set<string>();
    if (activeNum) {
      const segs = activeNum.split(".");
      for (let i = 1; i <= segs.length; i++) {
        ancestorNums.add(segs.slice(0, i).join("."));
      }
    }
    return {
      book: Number.isNaN(book) ? 0 : book,
      slug: slug ?? "",
      ancestorNums,
    };
  }, [pathname]);
}

interface ActiveState {
  book: number;
  slug: string;
  ancestorNums: Set<string>;
}

function SectionRow({
  node,
  bookNumber,
  level,
  active,
  isOpen,
  onToggle,
}: {
  node: NavNode;
  bookNumber: number;
  level: number;
  active: ActiveState;
  isOpen: boolean;
  onToggle: (key: string) => void;
}) {
  const href = `/${bookNumber}/${node.slug}`;
  const isActive = active.book === bookNumber && active.slug === node.slug;
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className="group flex items-center gap-1 rounded-md transition-colors"
        style={{ paddingInlineStart: `${level * 0.85}rem` }}
      >
        {hasChildren ? (
          <button
            type="button"
            aria-label={isOpen ? "طي القسم" : "فتح القسم"}
            aria-expanded={isOpen}
            onClick={() => onToggle(node.num)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-ink-faint transition-transform hover:text-ink"
          >
            <ChevronLeft
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-200",
                isOpen && "-rotate-90",
              )}
            />
          </button>
        ) : (
          <span className="w-7 shrink-0" />
        )}
        <Link
          href={href}
          aria-current={isActive ? "page" : undefined}
          className={cn(
            "flex-1 truncate rounded-md py-1.5 pr-1 font-kufi text-[0.86rem] leading-snug transition-colors",
            isActive
              ? "bg-accent-soft font-semibold text-accent"
              : "text-ink-soft hover:text-ink",
          )}
        >
          {node.title}
        </Link>
      </div>
      {hasChildren && isOpen && (
        <div className="border-s border-line-soft ps-2">
          {node.children.map((child) => (
            <SectionRow
              key={child.num}
              node={child}
              bookNumber={bookNumber}
              level={level + 1}
              active={active}
              isOpen={active.ancestorNums.has(child.num)}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function SidebarContent({
  books,
  onNavigate,
}: {
  books: NavBook[];
  onNavigate?: () => void;
}) {
  const active = useActiveRoute();
  const [query, setQuery] = React.useState("");
  const [openSet, setOpenSet] = React.useState<Set<string>>(new Set());

  const toggle = React.useCallback((key: string) => {
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const out: {
      bookNumber: number;
      slug: string;
      title: string;
      num: string;
      bookTitleOnly: string;
    }[] = [];
    const walk = (nodes: NavNode[], book: NavBook) => {
      for (const n of nodes) {
        const hay = `${n.title} ${n.num}`.toLowerCase();
        if (hay.includes(q)) {
          out.push({
            bookNumber: book.number,
            slug: n.slug,
            title: n.title,
            num: n.num,
            bookTitleOnly: book.titleOnly,
          });
        }
        if (n.children.length) walk(n.children, book);
      }
    };
    for (const b of books) walk(b.children, b);
    return out.slice(0, 60);
  }, [query, books]);

  return (
    <div className="flex h-full flex-col">
      <div className="relative p-3">
        <Search className="pointer-events-none absolute end-9 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="تصفية الفهرس…"
          aria-label="تصفية الفهرس"
          className="w-full rounded-lg border border-line bg-card py-2 pe-3 ps-9 font-kufi text-sm text-ink placeholder:text-ink-faint focus:border-accent-bright focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="مسح"
            className="absolute start-9 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-faint hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <nav
        className="min-h-0 flex-1 overflow-y-auto px-2 pb-6"
        aria-label="فهرس الكتاب"
      >
        {results ? (
          <div className="space-y-0.5">
            {results.length === 0 ? (
              <p className="px-3 py-6 text-center font-kufi text-sm text-ink-faint">
                لا نتائج مطابقة
              </p>
            ) : (
              results.map((r) => {
                const isActive =
                  active.book === r.bookNumber && active.slug === r.slug;
                return (
                  <Link
                    key={`${r.bookNumber}-${r.slug}`}
                    href={`/${r.bookNumber}/${r.slug}`}
                    onClick={onNavigate}
                    className={cn(
                      "block rounded-md px-3 py-2 transition-colors",
                      isActive ? "bg-accent-soft" : "hover:bg-paper-deep",
                    )}
                  >
                    <span className="mb-0.5 block font-kufi text-[0.68rem] text-accent-bright">
                      {r.bookTitleOnly}
                    </span>
                    <span
                      className={cn(
                        "block font-kufi text-[0.86rem] leading-snug",
                        isActive ? "font-semibold text-accent" : "text-ink",
                      )}
                    >
                      {r.title}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-1">
            {books.map((book) => (
              <BookGroup
                key={book.number}
                book={book}
                active={active}
                isOpen={
                  active.book === book.number ||
                  openSet.has(`book:${book.number}`)
                }
                onToggle={toggle}
                bookKey={`book:${book.number}`}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </nav>
    </div>
  );
}

function BookGroup({
  book,
  active,
  isOpen,
  onToggle,
  bookKey,
  onNavigate,
}: {
  book: NavBook;
  active: ActiveState;
  isOpen: boolean;
  onToggle: (key: string) => void;
  bookKey: string;
  onNavigate?: () => void;
}) {
  const isActiveBook = active.book === book.number;

  return (
    <div className="border-b border-line-soft pb-1">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={isOpen ? "طي الباب" : "فتح الباب"}
          aria-expanded={isOpen}
          onClick={() => onToggle(bookKey)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-ink-faint transition-transform hover:text-ink"
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "-rotate-90",
            )}
          />
        </button>
        <Link
          href={`/${book.slug}`}
          onClick={onNavigate}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-md py-1.5 font-kufi text-sm transition-colors",
            isActiveBook && !active.slug
              ? "font-bold text-accent"
              : "font-semibold text-ink hover:text-accent",
          )}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-accent/12 font-kufi text-xs font-bold text-accent">
            {book.titleArabic}
          </span>
          <span className="leading-tight">{book.titleOnly}</span>
        </Link>
      </div>
      {isOpen && (
        <div className="mt-0.5 space-y-0.5 ps-2">
          {book.children.map((node) => (
            <SectionRow
              key={node.num}
              node={node}
              bookNumber={book.number}
              level={0}
              active={active}
              isOpen={active.ancestorNums.has(node.num)}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}
