import "server-only";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Book, ContentBlock, FlatSection, Section, TocSection } from "@/types/content";

const GEN_DIR = resolve(process.cwd(), "data", "generated");

function readJson<T>(name: string): T {
  return JSON.parse(readFileSync(resolve(GEN_DIR, name), "utf8")) as T;
}

type RawBook = Omit<Book, never>;
type RawSection = TocSection & {
  blocks: ContentBlock[];
  wordCount: number;
  readingTime: number;
};

let _toc: Book[] | null = null;
export function getToc(): Book[] {
  if (!_toc) _toc = readJson<RawBook[]>("toc.json");
  return _toc;
}

let _index: FlatSection[] | null = null;
export function getFlatIndex(): FlatSection[] {
  if (_index) return _index;
  const raw = readJson<
    (Omit<FlatSection, "prev" | "next"> & {
      prev?: FlatSection;
      next?: FlatSection;
    })[]
  >("index.json");
  _index = raw.map((s) => ({
    num: s.num,
    slug: s.slug,
    title: s.title,
    desc: s.desc,
    level: s.level,
    bookNumber: s.bookNumber,
    bookTitle: s.bookTitle,
    wordCount: s.wordCount,
    readingTime: s.readingTime,
    prev: s.prev
      ? {
          slug: s.prev.slug,
          bookNumber: s.prev.bookNumber,
          title: s.prev.title,
        }
      : undefined,
    next: s.next
      ? {
          slug: s.next.slug,
          bookNumber: s.next.bookNumber,
          title: s.next.title,
        }
      : undefined,
  }));
  return _index;
}

const _bookCache = new Map<number, Section[]>();
export function getBookSections(bookNumber: number): Section[] {
  if (_bookCache.has(bookNumber)) return _bookCache.get(bookNumber)!;
  const raw = readJson<RawSection[]>(`book-${bookNumber}.json`);
  const sections: Section[] = raw.map((s) => ({
    num: s.num,
    slug: s.slug,
    title: s.title,
    desc: s.desc,
    level: s.level,
    bookNumber: s.bookNumber,
    children: [],
    blocks: s.blocks,
    wordCount: s.wordCount,
    readingTime: s.readingTime,
  }));
  _bookCache.set(bookNumber, sections);
  return sections;
}

export function getBook(bookNumber: number): Book | undefined {
  return getToc().find((b) => b.number === bookNumber);
}

export function getSection(
  bookNumber: number,
  slug: string,
): Section | undefined {
  return getBookSections(bookNumber).find((s) => s.slug === slug);
}

export function getAllSectionSlugs(): { bookNumber: number; slug: string }[] {
  return getFlatIndex().map((s) => ({
    bookNumber: s.bookNumber,
    slug: s.slug,
  }));
}

export function getAdjacent(bookNumber: number, slug: string) {
  const flat = getFlatIndex();
  const i = flat.findIndex(
    (s) => s.bookNumber === bookNumber && s.slug === slug,
  );
  if (i === -1) return { prev: undefined, next: undefined };
  return { prev: flat[i - 1], next: flat[i + 1] };
}

export function getStats() {
  const flat = getFlatIndex();
  return {
    books: getToc().length,
    sections: flat.length,
    words: flat.reduce((sum, s) => sum + s.wordCount, 0),
    readingTimeHours: Math.round(
      flat.reduce((sum, s) => sum + s.readingTime, 0) / 60,
    ),
  };
}

export interface NavNode {
  num: string;
  slug: string;
  title: string;
  level: number;
  bookNumber: number;
  children: NavNode[];
}

export interface NavBook {
  number: number;
  slug: string;
  title: string;
  titleOnly: string;
  titleArabic: string;
  children: NavNode[];
}

function toNavNode(s: TocSection): NavNode {
  return {
    num: s.num,
    slug: s.slug,
    title: s.title,
    level: s.level,
    bookNumber: s.bookNumber,
    children: s.children.map(toNavNode),
  };
}

let _navTree: NavBook[] | null = null;
export function getNavTree(): NavBook[] {
  if (_navTree) return _navTree;
  _navTree = getToc().map((b) => ({
    number: b.number,
    slug: b.slug,
    title: b.title,
    titleOnly: b.titleOnly,
    titleArabic: b.titleArabic,
    children: b.sections.map(toNavNode),
  }));
  return _navTree;
}

export function flattenNav(nodes: NavNode[]): NavNode[] {
  const out: NavNode[] = [];
  for (const n of nodes) {
    out.push(n);
    out.push(...flattenNav(n.children));
  }
  return out;
}
