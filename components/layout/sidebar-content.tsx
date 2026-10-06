"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import type { NavBook, NavNode } from "@/lib/content";
import { sectionRoute } from "@/lib/route";
import { cn } from "@/lib/utils";

function useActiveRoute() {
  const pathname = usePathname();

  return React.useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const book = parts[0] ? parseInt(parts[0], 10) : NaN;

    return {
      book: Number.isNaN(book) ? 0 : book,
      slug: parts[1] ?? "",
    };
  }, [pathname]);
}

type SearchResult = {
  bookNumber: number;
  title: string;
  num: string;

  /**
   * The actual page that contains this result.
   *
   * For a top-level node:
   * pageNum === node.num
   * pageSlug === node.slug
   *
   * For a nested node:
   * pageNum/pageSlug belong to the top-level parent page.
   */
  pageNum: string;
  pageSlug: string;

  /**
   * The exact element id that should be scrolled to inside the page.
   *
   * A top-level (chapter) node renders a header with id === node.slug.
   * A nested section renders a <section id="{slug}">.
   */
  anchor: string;

  bookTitleOnly: string;
};

export function SidebarContent({
  books,
  onNavigate,
}: {
  books: NavBook[];
  onNavigate?: () => void;
}) {
  const active = useActiveRoute();
  const [query, setQuery] = React.useState("");

  const results = React.useMemo<SearchResult[] | null>(() => {
    const q = query.trim().toLowerCase();

    if (!q) return null;

    const out: SearchResult[] = [];

    /**
     * Walk through the navigation tree.
     *
     * The important part here is that we keep track of the
     * TOP-LEVEL PAGE that owns the current node.
     *
     * This prevents nested search results from generating
     * invalid routes.
     * 
     */
    const walk = (
      nodes: NavNode[],
      book: NavBook,
      parentPage?: {
        num: string;
        slug: string;
      },
    ) => {
      for (const node of nodes) {
        const haystack = `${node.title} ${node.num}`.toLowerCase();

        /**
         * If this is a top-level node, this node itself is the page.
         *
         * If this is a nested node, use the previously tracked
         * top-level page.
         */
        const page = parentPage ?? {
          num: node.num,
          slug: node.slug,
        };

        /**
         * Top-level (chapter) nodes render their own <header id="slug">.
         * Nested sections render <section id="{slug}">.
         */
        const anchor = node.slug;

        if (haystack.includes(q)) {
          out.push({
            bookNumber: book.number,
            title: node.title,
            num: node.num,

            pageNum: page.num,
            pageSlug: page.slug,

            anchor,

            bookTitleOnly: book.titleOnly,
          });
        }

        /**
         * Children live inside the current page, so they must inherit
         * the same page route.
         */
        if (node.children.length) {
          walk(node.children, book, page);
        }
      }
    };

    for (const book of books) {
      walk(book.children, book);
    }

    return out.slice(0, 60);
  }, [query, books]);
    console.log(results);

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Search */}
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

      {/* Navigation / Search Results */}
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
              results.map((result) => {
                const pageRoute = sectionRoute(
                  result.bookNumber,
                  result.pageNum,
                  result.pageSlug,
                );

                /**
                 * The page route and the section anchor are separate.
                 *
                 * Example:
                 *
                 * /1/chapter-one#section-one
                 *
                 * This allows Next.js to open the correct page AND
                 * the browser to jump directly to the matching section.
                 */
                const href = `${pageRoute}#${
                  result.anchor}`;

                /**
                 * A result is active when:
                 *
                 * - We're currently on its page
                 * - The current URL hash points to this section
                 */
                const isActive =
                  active.book === result.bookNumber &&
                  active.slug === result.pageSlug;

                return (
                  <Link
                    key={`${result.bookNumber}-${result.pageNum}-${result.anchor}`}
                    href={href}
                    onClick={(e) => {
                      // If we're already on the target page, scroll directly to
                      // the heading so a same-page search result actually moves.
                      if (
                        active.book === result.bookNumber &&
                        active.slug === result.pageSlug
                      ) {
                        const el = document.getElementById(result.anchor);
                        if (el) {
                          e.preventDefault();
                          el.scrollIntoView({ block: "start" });
                        }
                      }
                      onNavigate?.();
                    }}
                    className={cn(
                      "block rounded-md px-3 py-2 transition-colors",
                      isActive
                        ? "bg-accent-soft"
                        : "hover:bg-paper-deep",
                    )}
                  >
                    <span className="mb-0.5 block font-kufi text-[0.68rem] text-accent-bright">
                      {result.bookTitleOnly}
                    </span>

                    <span
                      className={cn(
                        "block font-kufi text-[0.86rem] leading-snug",
                        isActive
                          ? "font-semibold text-accent"
                          : "text-ink",
                      )}
                    >
                      {result.title}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {books.map((book) => (
              <BookGroup
                key={book.number}
                book={book}
                active={active}
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
  onNavigate,
}: {
  book: NavBook;
  active: {
    book: number;
    slug: string;
  };
  onNavigate?: () => void;
}) {
  const isActiveBook = active.book === book.number;

  return (
    <div>
      {/* Book */}
      <Link
        href={`/${book.slug}`}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-2 rounded-md py-1.5 font-kufi text-sm transition-colors",
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

      {/* Chapters / Sections */}
      {book.children.length > 0 && (
        <ul className="mt-1 space-y-0.5 border-s border-line-soft ps-2">
          {book.children.map((node) => {
            const isActive = isActiveBook && active.slug === node.slug;

            return (
              <li key={node.num}>
                <Link
                  href={`/${book.number}/${node.slug}`}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex items-baseline gap-1.5 rounded-md py-1 pe-2 font-kufi text-[0.82rem] leading-snug transition-colors",
                    isActive
                      ? "bg-accent-soft font-semibold text-accent"
                      : "text-ink-soft hover:text-ink",
                  )}
                >
                  <span className="shrink-0 font-kufi text-[0.62rem] text-accent-bright/80">
                    {node.num}
                  </span>

                  <span className="truncate">{node.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}