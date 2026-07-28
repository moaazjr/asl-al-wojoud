import AdmZip from "adm-zip";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SOURCE_DIR = resolve(ROOT, "source");
const OUT_DIR = resolve(ROOT, "data", "generated");
const PUBLIC_DIR = resolve(ROOT, "public");

const DOCX_PATH = resolve(
  SOURCE_DIR,
  "بسم الله الرحمن الرحيم. ملف أصل الوجود 09-07-2026.docx",
);
const HTML_PATH = resolve(SOURCE_DIR, "asl-alwujud-site.html");
const BOOK_COUNT = 7;

type RawEntry = { num: string; title: string; desc?: string };
type RawBook = { n: number; title: string; entries: RawEntry[] };

function extractBooksJson(html: string): RawBook[] {
  const start = html.indexOf("const BOOKS = ");
  if (start === -1) throw new Error("BOOKS marker not found in HTML");
  const bracketStart = html.indexOf("[", start);
  let depth = 0;
  let inStr = false;
  let esc = false;
  let end = bracketStart;
  for (let i = bracketStart; i < html.length; i++) {
    const c = html[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === "[") depth++;
    else if (c === "]") {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  return JSON.parse(html.slice(bracketStart, end + 1));
}

interface Para {
  text: string;
  headingStyle: boolean;
  listItem: boolean;
  numId?: string;
}

function parseParagraphs(xml: string): Para[] {
  const matches = xml.match(/<w:p[ >].*?<\/w:p>/gs) ?? [];
  return matches
    .map((pxml) => {
      const bold =
        /<w:b(?:\s[^>]*)?\s*\/?>/.test(pxml) && !/w:val="0"/.test(pxml);
      const rStyleAb = /<w:rStyle\s+w:val="ab"/.test(pxml);
      const bigFont = /<w:sz\s+w:val="(2[89]|3\d|4\d)"/.test(pxml);
      const headingStyle = bold || rStyleAb || bigFont;
      const listItem = /<w:numPr>/.test(pxml);
      let numId: string | undefined;
      const numIdMatch = pxml.match(/<w:numId\s+w:val="([^"]+)"/);
      if (numIdMatch) numId = numIdMatch[1];
      const textParts: string[] = [];
      const tokenRe =
        /<w:t[^>]*>([^<]*)<\/w:t>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>/g;
      let m: RegExpExecArray | null;
      while ((m = tokenRe.exec(pxml)) !== null) {
        if (m[0].startsWith("<w:tab")) textParts.push("\t");
        else if (m[0].startsWith("<w:br")) textParts.push("\n");
        else textParts.push(m[1]);
      }
      return { text: textParts.join("").trim(), headingStyle, listItem, numId };
    })
    .filter((p) => p.text.length > 0);
}

const numRe = /^(\d+(?:\.\d+)+)(?:\s*[-–—:])?\s*(.*)$/;
const citationRe = /\[\s*([^\[\]:]+?)\s*:\s*([^\[\]]+?)\s*\]/;

function countWords(blocks: { text: string; items?: string[] }[]): number {
  let n = 0;
  for (const b of blocks) {
    if (b.items) for (const it of b.items) n += it.trim().split(/\s+/).length;
    else n += b.text.trim().split(/\s+/).length;
  }
  return n;
}

type BlockOut = {
  type: "paragraph" | "callout" | "list";
  text: string;
  citation?: { surah: string; ayah: string };
  ordered?: boolean;
  items?: string[];
};

function buildBlocks(paras: Para[]): BlockOut[] {
  const blocks: BlockOut[] = [];
  let listBuffer: Para[] = [];
  let currentOrdered = false;
  const flushList = () => {
    if (listBuffer.length === 0) return;
    blocks.push({
      type: "list",
      text: listBuffer.map((p) => p.text).join("\n"),
      items: listBuffer.map((p) => p.text),
      ordered: currentOrdered,
    });
    listBuffer = [];
  };
  for (const p of paras) {
    if (p.listItem) {
      currentOrdered = Boolean(p.numId);
      listBuffer.push(p);
      continue;
    }
    flushList();
    const cit = p.text.match(citationRe);
    if (cit) {
      blocks.push({
        type: "callout",
        text: p.text,
        citation: { surah: cit[1].trim(), ayah: cit[2].trim() },
      });
    } else {
      blocks.push({ type: "paragraph", text: p.text });
    }
  }
  flushList();
  return blocks;
}

const arabicBookDigits = ["", "١", "٢", "٣", "٤", "٥", "٦", "٧"];

interface TocNode {
  num: string;
  slug: string;
  title: string;
  desc?: string;
  level: number;
  bookNumber: number;
  children: TocNode[];
}

function buildTree(nodes: TocNode[]): TocNode[] {
  const byNum = new Map(nodes.map((n) => [n.num, n]));
  const roots: TocNode[] = [];
  for (const node of nodes) {
    const parts = node.num.split(".");
    const parentNum = parts.slice(0, -1).join(".");
    const parent = parentNum ? byNum.get(parentNum) : undefined;
    if (parent && parent !== node) parent.children.push(node);
    else roots.push(node);
  }
  return roots;
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const html = readFileSync(HTML_PATH, "utf8");
  const booksRaw = extractBooksJson(html);
  const bookTitles = new Map<number, string>();
  for (const b of booksRaw) bookTitles.set(b.n, b.title);
  const tocEntryMap = new Map<string, RawEntry>();
  for (const b of booksRaw) for (const e of b.entries) tocEntryMap.set(e.num, e);

  const zip = new AdmZip(DOCX_PATH);
  const xml = zip.readAsText("word/document.xml", "utf8");
  const paras = parseParagraphs(xml);
  console.log(`Parsed ${paras.length} non-empty paragraphs`);

  const headings: { num: string; docxTitle: string; index: number }[] = [];
  const seenHeading = new Set<string>();
  paras.forEach((p, i) => {
    if (!p.headingStyle) return;
    const m = p.text.match(numRe);
    if (!m) return;
    const bookNumber = parseInt(m[1].split(".")[0], 10);
    if (bookNumber < 1 || bookNumber > BOOK_COUNT) return;
    if (seenHeading.has(m[1])) return;
    seenHeading.add(m[1]);
    headings.push({ num: m[1], docxTitle: m[2].trim(), index: i });
  });
  console.log(
    `Distinct headings in DOCX (books 1-${BOOK_COUNT}): ${headings.length}`,
  );

  const headingByIndex = new Map<number, string>();
  for (const h of headings) headingByIndex.set(h.index, h.num);

  const contentByNum = new Map<string, Para[]>();
  let currentNum: string | null = null;
  paras.forEach((p, i) => {
    if (headingByIndex.has(i)) {
      currentNum = headingByIndex.get(i)!;
      if (!contentByNum.has(currentNum)) contentByNum.set(currentNum, []);
      return;
    }
    if (currentNum) contentByNum.get(currentNum)!.push(p);
  });

  const allNodes: TocNode[] = headings.map((h) => {
    const toc = tocEntryMap.get(h.num);
    const title = toc?.title ?? h.docxTitle;
    const level = h.num.split(".").length;
    return {
      num: h.num,
      slug: h.num.replace(/\./g, "-"),
      title,
      desc: toc?.desc,
      level,
      bookNumber: parseInt(h.num.split(".")[0], 10),
      children: [],
    };
  });

  const booksOut = [];
  for (let n = 1; n <= BOOK_COUNT; n++) {
    const fullTitle = bookTitles.get(n) ?? `الباب ${n}`;
    const titleOnly = fullTitle.replace(/^الباب\s+[^:]+:\s*/, "");
    const nodes = allNodes.filter((x) => x.bookNumber === n);
    booksOut.push({
      number: n,
      slug: String(n),
      title: fullTitle,
      titleOnly,
      titleArabic: arabicBookDigits[n],
      sections: buildTree(nodes),
      sectionCount: nodes.length,
    });
  }
  writeFileSync(
    resolve(OUT_DIR, "toc.json"),
    JSON.stringify(booksOut, null, 2),
    "utf8",
  );
  console.log("Wrote toc.json");

  const flatList: {
    num: string;
    slug: string;
    title: string;
    desc?: string;
    level: number;
    bookNumber: number;
    bookTitle: string;
    wordCount: number;
    readingTime: number;
  }[] = [];

  for (let n = 1; n <= BOOK_COUNT; n++) {
    const nodes = allNodes.filter((x) => x.bookNumber === n);
    const sectionsOut = nodes.map((node) => {
      const body = contentByNum.get(node.num) ?? [];
      const blocks = buildBlocks(body);
      const wordCount = countWords(blocks);
      const readingTime = Math.max(1, Math.round(wordCount / 180));
      return { ...node, blocks, wordCount, readingTime };
    });
    writeFileSync(
      resolve(OUT_DIR, `book-${n}.json`),
      JSON.stringify(sectionsOut, null, 2),
      "utf8",
    );
    for (const s of sectionsOut) {
      flatList.push({
        num: s.num,
        slug: s.slug,
        title: s.title,
        desc: s.desc,
        level: s.level,
        bookNumber: s.bookNumber,
        bookTitle: booksOut[n - 1].title,
        wordCount: s.wordCount,
        readingTime: s.readingTime,
      });
    }
  }
  console.log("Wrote book-*.json");

  const flatWithNav = flatList.map((s, i) => ({
    ...s,
    prev: i > 0 ? flatList[i - 1] : undefined,
    next: i < flatList.length - 1 ? flatList[i + 1] : undefined,
  }));
  writeFileSync(
    resolve(OUT_DIR, "index.json"),
    JSON.stringify(flatWithNav, null, 2),
    "utf8",
  );

  const searchDocs: { i: number; s: string; bn: number; bt: string; n: string; t: string; d: string; c: string }[] = [];
  let searchIdx = 0;
  for (let n = 1; n <= BOOK_COUNT; n++) {
    const nodes = allNodes.filter((x) => x.bookNumber === n);
    for (const node of nodes) {
      const body = contentByNum.get(node.num) ?? [];
      const blocks = buildBlocks(body);
      const content = blocks
        .map((b) => (b.items ? b.items.join(" ") : b.text))
        .join(" ");
      searchDocs.push({
        i: searchIdx++,
        s: node.slug,
        bn: node.bookNumber,
        bt: booksOut[n - 1].title,
        n: node.num,
        t: node.title,
        d: node.desc ?? "",
        c: content,
      });
    }
  }
  mkdirSync(PUBLIC_DIR, { recursive: true });
  writeFileSync(
    resolve(PUBLIC_DIR, "search-docs.json"),
    JSON.stringify(searchDocs),
    "utf8",
  );
  console.log(
    `Wrote search-docs.json (${(JSON.stringify(searchDocs).length / 1024).toFixed(0)} KB)`,
  );

  const empty = flatList.filter((s) => s.wordCount === 0).length;
  const totalWords = flatList.reduce((a, s) => a + s.wordCount, 0);
  console.log(
    `Done. ${flatList.length} sections (${empty} empty), ~${totalWords.toLocaleString("en-US")} words.`,
  );
}

main();
