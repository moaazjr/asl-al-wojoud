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

export interface OutlineNode {
  num: string;
  slug: string;
  title: string;
  level: number;
  children: OutlineNode[];
}

export interface OutlineBook {
  number: number;
  titleOnly: string;
  children: OutlineNode[];
}

function toOutlineNode(s: TocSection): OutlineNode {
  return {
    num: s.num,
    slug: s.slug,
    title: s.title,
    level: s.level,
    children: s.children.map(toOutlineNode),
  };
}

let _navOutline: OutlineBook[] | null = null;
export function getNavOutline(): OutlineBook[] {
  if (_navOutline) return _navOutline;
  _navOutline = getToc().map((b) => ({
    number: b.number,
    titleOnly: b.titleOnly,
    children: b.sections.map(toOutlineNode),
  }));
  return _navOutline;
}

export interface ChapterSection {
  num: string;
  slug: string;
  title: string;
  desc?: string;
  level: number;
  bookNumber: number;
  blocks: ContentBlock[];
  children: ChapterSection[];
}

export interface Chapter {
  num: string;
  slug: string;
  title: string;
  desc?: string;
  level: number;
  bookNumber: number;
  bookTitle: string;
  bookTitleOnly: string;
  titleArabic: string;
  blocks: ContentBlock[];
  sections: ChapterSection[];
  wordCount: number;
  readingTime: number;
}

export interface FlatChapter {
  num: string;
  slug: string;
  title: string;
  bookNumber: number;
  bookTitle: string;
}

function toChapterSection(
  node: TocSection,
  flatMap: Map<string, RawSection>,
): ChapterSection {
  const flat = flatMap.get(node.num);
  return {
    num: node.num,
    slug: node.slug,
    title: node.title,
    desc: node.desc,
    level: node.level,
    bookNumber: node.bookNumber,
    blocks: flat?.blocks ?? [],
    children: node.children.map((c) => toChapterSection(c, flatMap)),
  };
}

export function getChapters(bookNumber: number): Chapter[] {
  const book = getBook(bookNumber);
  if (!book) return [];
  const sections = getBookSections(bookNumber);
  const flatMap = new Map(sections.map((s) => [s.num, s as RawSection]));
  return book.sections.map((node) => toChapter(node, book, flatMap));
}

function toChapter(
  node: TocSection,
  book: Book,
  flatMap: Map<string, RawSection>,
): Chapter {
  const root = toChapterSection(node, flatMap);
  const words = countChapterWords(root);
  const minutes = Math.max(1, Math.round(words / 180));
  return {
    num: root.num,
    slug: root.slug,
    title: root.title,
    desc: root.desc,
    level: root.level,
    bookNumber: root.bookNumber,
    bookTitle: book.title,
    bookTitleOnly: book.titleOnly,
    titleArabic: book.titleArabic,
    blocks: root.blocks,
    sections: root.children,
    wordCount: words,
    readingTime: minutes,
  };
}

function countChapterWords(node: ChapterSection): number {
  let n = node.blocks.reduce(
    (sum, b) =>
      sum +
      (b.items
        ? b.items.reduce((a, it) => a + it.trim().split(/\s+/).length, 0)
        : b.text.trim().split(/\s+/).length),
    0,
  );
  for (const c of node.children) n += countChapterWords(c);
  return n;
}

const _chapterCache = new Map<number, Chapter[]>();
export function getChapterList(bookNumber: number): Chapter[] {
  if (_chapterCache.has(bookNumber)) return _chapterCache.get(bookNumber)!;
  const chapters = getChapters(bookNumber);
  _chapterCache.set(bookNumber, chapters);
  return chapters;
}

export function getChapter(
  bookNumber: number,
  slug: string,
): Chapter | undefined {
  return getChapterList(bookNumber).find((c) => c.slug === slug);
}

export function getAllChapterSlugs(): { bookNumber: number; slug: string }[] {
  return getToc().flatMap((b) =>
    getChapterList(b.number).map((c) => ({
      bookNumber: c.bookNumber,
      slug: c.slug,
    })),
  );
}

let _flatChapters: FlatChapter[] | null = null;
function getFlatChapters(): FlatChapter[] {
  if (_flatChapters) return _flatChapters;
  const out: FlatChapter[] = [];
  for (const book of getToc()) {
    for (const c of getChapterList(book.number)) {
      out.push({
        num: c.num,
        slug: c.slug,
        title: c.title,
        bookNumber: c.bookNumber,
        bookTitle: c.bookTitle,
      });
    }
  }
  _flatChapters = out;
  return out;
}

export function getAdjacentChapters(
  bookNumber: number,
  slug: string,
): { prev?: FlatChapter; next?: FlatChapter } {
  const flat = getFlatChapters();
  const i = flat.findIndex(
    (c) => c.bookNumber === bookNumber && c.slug === slug,
  );
  if (i === -1) return {};
  return { prev: flat[i - 1], next: flat[i + 1] };
}
