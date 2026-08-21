import AdmZip from "adm-zip";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const SOURCE_DIR = resolve(ROOT, "source");
const OUT_DIR = resolve(ROOT, "data", "generated");
const PUBLIC_DIR = resolve(ROOT, "public");

const DOCX_PATH = resolve(
  SOURCE_DIR,
  "أصل الوجود — النسخة المحسنة.docx",
);
const BOOK_COUNT = 7;

const BOOK_ORDINALS: Record<string, number> = {
  "الأول": 1, "الثاني": 2, "الثالث": 3,
  "الرابع": 4, "الخامس": 5, "السادس": 6, "السابع": 7,
};

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

const numRe = /^(\d+(?:\.\d+)+)(?:\s*[-–—:\sـ])*\s*(.*)$/;
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

function isBookTitleLine(text: string): boolean {
  return /^الباب\s+(الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع)$/.test(text.trim());
}

function getBookNumberFromTitle(text: string): number | null {
  for (const [ordinal, num] of Object.entries(BOOK_ORDINALS)) {
    if (text.includes(ordinal)) return num;
  }
  return null;
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const zip = new AdmZip(DOCX_PATH);
  const xml = zip.readAsText("word/document.xml", "utf8");
  const allParas = parseParagraphs(xml);
  console.log(`Parsed ${allParas.length} non-empty paragraphs from DOCX`);

  let lastTocIdx = 0;
  for (let i = 0; i < allParas.length; i++) {
    if (allParas[i].text.includes("\t") && /^\d+\.\d+/.test(allParas[i].text))
      lastTocIdx = i;
  }
  console.log(`TOC section ends at paragraph index ${lastTocIdx}`);

  const contentParas = allParas.slice(lastTocIdx + 1);

  let contentEndIdx = contentParas.length;
  for (let i = contentParas.length - 1; i >= 0; i--) {
    const t = contentParas[i].text.trim();
    if (t === "خاتمة الكتاب" && !t.includes("\t")) {
      contentEndIdx = i + 1;
      break;
    }
  }
  const paras = contentParas.slice(0, contentEndIdx);
  console.log(`Content paragraphs: ${paras.length}`);

  const bookTitleMap = new Map<number, string>();
  for (let i = 0; i < paras.length; i++) {
    const t = paras[i].text.trim();
    if (isBookTitleLine(t)) {
      const bn = getBookNumberFromTitle(t);
      if (bn && !bookTitleMap.has(bn)) {
        let fullTitle = t;
        if (i + 1 < paras.length) {
          const nextText = paras[i + 1].text.trim();
          if (
            nextText &&
            !numRe.test(nextText) &&
            !isBookTitleLine(nextText) &&
            !/^(بين يدي|خاتمة|بسم الله)/.test(nextText)
          ) {
            fullTitle = t + ": " + nextText;
          }
        }
        bookTitleMap.set(bn, fullTitle);
        console.log(`Book ${bn} title: ${fullTitle}`);
      }
    }
  }

  for (let bn = 1; bn <= BOOK_COUNT; bn++) {
    if (!bookTitleMap.has(bn)) {
      console.log(`WARNING: Book ${bn} title not found, using fallback`);
      bookTitleMap.set(bn, `الباب ${bn}`);
    }
  }

  const headingByIndex = new Map<number, { num: string; title: string }>();
  const seenHeading = new Set<string>();

  const specialSections: {
    idx: number;
    num: string;
    title: string;
    bookNumber: number;
  }[] = [];

  let currentBookNum = 0;

  for (let i = 0; i < paras.length; i++) {
    const t = paras[i].text.trim();

    if (isBookTitleLine(t)) {
      const bn = getBookNumberFromTitle(t);
      if (bn) currentBookNum = bn;
      continue;
    }

    if (/^بسم الله الرحمن الرحيم$/.test(t)) continue;

    if (/^التعريف بالنشر$/.test(t)) break;

    const khatamaMatch = t.match(/^خاتمة\s+الباب\s+(الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع)$/);
    if (khatamaMatch) {
      const bn = getBookNumberFromTitle(t);
      if (bn) {
        const kNum = `${bn}.z`;
        if (!seenHeading.has(kNum)) {
          seenHeading.add(kNum);
          specialSections.push({ idx: i, num: kNum, title: t, bookNumber: bn });
          headingByIndex.set(i, { num: kNum, title: t });
        }
      }
      continue;
    }

    const baynaMatch = t.match(/^بين يدي الباب\s+(الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع)$/);
    if (baynaMatch) {
      const bn = getBookNumberFromTitle(t);
      if (bn) {
        const introNum = `${bn}.0`;
        if (!seenHeading.has(introNum)) {
          seenHeading.add(introNum);
          specialSections.push({
            idx: i,
            num: introNum,
            title: t,
            bookNumber: bn,
          });
          headingByIndex.set(i, { num: introNum, title: t });
        }
      }
      continue;
    }

    if (/^مقد[ّ]?مة الكتاب$/.test(t) && currentBookNum === 0) {
      if (!seenHeading.has("pre.0")) {
        seenHeading.add("pre.0");
        specialSections.push({
          idx: i,
          num: "pre.0",
          title: t,
          bookNumber: 0,
        });
        headingByIndex.set(i, { num: "pre.0", title: t });
        currentBookNum = 0;
      }
      continue;
    }

    if (/^"تنويه"$/.test(t) || t === "تنويه") {
      if (!seenHeading.has("pre.1")) {
        seenHeading.add("pre.1");
        specialSections.push({ idx: i, num: "pre.1", title: t, bookNumber: 0 });
        headingByIndex.set(i, { num: "pre.1", title: t });
      }
      continue;
    }

    const m = t.match(numRe);
    if (m) {
      const num = m[1];
      const title = m[2].trim();
      const bookNumber = parseInt(num.split(".")[0], 10);
      if (bookNumber < 1 || bookNumber > BOOK_COUNT) continue;
      if (currentBookNum > 0 && bookNumber !== currentBookNum) continue;
      if (seenHeading.has(num)) continue;
      seenHeading.add(num);
      if (bookNumber > currentBookNum) currentBookNum = bookNumber;
      headingByIndex.set(i, { num, title });
    }
  }

  const headings = [...headingByIndex.entries()].map(([idx, h]) => ({
    num: h.num,
    docxTitle: h.title,
    index: idx,
  }));

  console.log(`Total headings found: ${headings.length}`);

  const headingIndices = new Set(headingByIndex.keys());
  const contentByNum = new Map<string, Para[]>();
  let currentNum: string | null = null;

  for (let i = 0; i < paras.length; i++) {
    if (headingIndices.has(i)) {
      const h = headingByIndex.get(i)!;
      currentNum = h.num;
      if (!contentByNum.has(currentNum)) contentByNum.set(currentNum, []);
      continue;
    }
    if (currentNum) contentByNum.get(currentNum)!.push(paras[i]);
  }

  const allNodes: TocNode[] = headings.map((h) => {
    const level = h.num === "pre.0" || h.num === "pre.1"
      ? 2
      : h.num.endsWith(".z") || h.num.endsWith(".0")
        ? 2
        : h.num.split(".").length;
    const bookNumber = h.num.startsWith("pre.")
      ? 0
      : parseInt(h.num.split(".")[0], 10);
    return {
      num: h.num,
      slug: h.num.replace(/\./g, "-"),
      title: h.docxTitle,
      level,
      bookNumber,
      children: [],
    };
  });

  const preNodes = allNodes.filter((n) => n.bookNumber === 0);
  const booksOut = [];
  for (let n = 0; n <= BOOK_COUNT; n++) {
    const fullTitle =
      n === 0
        ? "المقدمة والمقدّمات"
        : bookTitleMap.get(n)!;
    const titleOnly =
      n === 0
        ? "المقدمة والمقدّمات"
        : fullTitle.replace(/^الباب\s+[^:]+:\s*/, "");
    const nodes = n === 0 ? preNodes : allNodes.filter((x) => x.bookNumber === n);
    booksOut.push({
      number: n,
      slug: String(n),
      title: fullTitle,
      titleOnly,
      titleArabic: n === 0 ? "" : arabicBookDigits[n],
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

  for (let n = 0; n <= BOOK_COUNT; n++) {
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
        bookTitle: booksOut[n].title,
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

  const searchDocs: {
    i: number;
    s: string;
    bn: number;
    bt: string;
    n: string;
    t: string;
    d: string;
    c: string;
  }[] = [];
  let searchIdx = 0;
  for (let n = 0; n <= BOOK_COUNT; n++) {
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
        bt: booksOut[n].title,
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
