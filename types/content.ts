export type BlockType = "paragraph" | "callout" | "list";

export interface ContentBlock {
  type: BlockType;
  text: string;
  citation?: { surah: string; ayah: string };
  ordered?: boolean;
  items?: string[];
}

export interface TocSection {
  num: string;
  slug: string;
  title: string;
  desc?: string;
  level: number;
  bookNumber: number;
  children: TocSection[];
}

export interface Book {
  number: number;
  slug: string;
  title: string;
  titleOnly: string;
  titleArabic: string;
  sections: TocSection[];
  sectionCount: number;
}

export interface Section extends TocSection {
  blocks: ContentBlock[];
  wordCount: number;
  readingTime: number;
}

export interface FlatSection {
  num: string;
  slug: string;
  title: string;
  desc?: string;
  level: number;
  bookNumber: number;
  bookTitle: string;
  wordCount: number;
  readingTime: number;
  prev?: { slug: string; bookNumber: number; title: string };
  next?: { slug: string; bookNumber: number; title: string };
}
