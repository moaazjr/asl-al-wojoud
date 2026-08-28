import AdmZip from "adm-zip";
import { resolve } from "node:path";

const DOCX_PATH = resolve(import.meta.dirname, "source", "new.docx");

const zip = new AdmZip(DOCX_PATH);
const xml = zip.readAsText("word/document.xml", "utf8");

const pMatches = xml.match(/<w:p[ >].*?<\/w:p>/gs) ?? [];

function getText(pxml: string): string {
  const parts: string[] = [];
  const re = /<w:t[^>]*>([^<]*)<\/w:t>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(pxml)) !== null) {
    if (m[0].startsWith("<w:tab")) parts.push("\t");
    else if (m[0].startsWith("<w:br")) parts.push("\n");
    else parts.push(m[1]);
  }
  return parts.join("").trim();
}

function isBold(pxml: string): boolean {
  return /<w:b(?:\s[^>]*)?\s*\/?>/.test(pxml) && !/w:val="0"/.test(pxml);
}

function isListItem(pxml: string): boolean {
  return /<w:numPr>/.test(pxml);
}

const numRe = /^(\d+(?:\.\d+)+)(?:\s*[-–—:\sـ])*\s*(.*)$/;

interface HeadingInfo {
  i: number; num: string; title: string; bold: boolean; listItem: boolean;
}

const allNumHeadings: HeadingInfo[] = [];
const boldNonNumHeadings: { i: number; text: string; listItem: boolean }[] = [];

for (let i = 0; i < pMatches.length; i++) {
  const t = getText(pMatches[i]);
  if (!t) continue;
  const bold = isBold(pMatches[i]);
  const listItem = isListItem(pMatches[i]);
  const m = t.match(numRe);
  if (m) {
    const bn = parseInt(m[1].split(".")[0], 10);
    if (bn >= 1 && bn <= 7) {
      allNumHeadings.push({ i, num: m[1], title: m[2], bold, listItem });
    }
  }
  if (bold && !m && t.length > 2 && t.length < 100) {
    boldNonNumHeadings.push({ i, text: t, listItem });
  }
}

console.log(`Total numbered headings (books 1-7): ${allNumHeadings.length}`);
console.log(`  Bold: ${allNumHeadings.filter(h => h.bold).length}`);
console.log(`  Non-bold: ${allNumHeadings.filter(h => !h.bold).length}`);
console.log(`  Non-bold + listItem: ${allNumHeadings.filter(h => !h.bold && h.listItem).length}`);
console.log(`  Non-bold + !listItem: ${allNumHeadings.filter(h => !h.bold && !h.listItem).length}`);

const perBook: Record<number, number> = {};
allNumHeadings.forEach(h => {
  const bn = parseInt(h.num.split(".")[0]);
  perBook[bn] = (perBook[bn] || 0) + 1;
});
console.log(`\nHeadings per book:`, perBook);

console.log(`\nBold non-numbered headings (potential special sections):`);
boldNonNumHeadings.forEach(h =>
  console.log(`  [${h.i}] "${h.text.substring(0, 80)}" listItem=${h.listItem}`)
);

const TOC_END = 718;
const contentHeadings = allNumHeadings.filter(h => h.i >= TOC_END);
console.log(`\nAfter TOC (idx >= ${TOC_END}): ${contentHeadings.length} numbered headings`);
console.log(`  Bold: ${contentHeadings.filter(h => h.bold).length}`);
console.log(`  Non-bold: ${contentHeadings.filter(h => !h.bold).length}`);

// Simulate parser logic
function isBookTitleLine(text: string): boolean {
  return /^الباب\s+(الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع)$/.test(text.trim());
}

const seenHeading = new Set<string>();
const foundIndices = new Set<number>();
let skippedBookTitle = 0;
let skippedSpecial = 0;
let skippedDuplicate = 0;
let skippedOOB = 0;

for (const h of contentHeadings) {
  const t = getText(pMatches[h.i]).trim();
  
  if (isBookTitleLine(t)) { skippedBookTitle++; continue; }
  if (/^بسم الله الرحمن الرحيم$/.test(t)) continue;
  if (/^التعريف بالنشر$/.test(t)) break;

  const khatamaMatch = t.match(/^خاتمة\s+الباب\s+(الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع)$/);
  if (khatamaMatch) { skippedSpecial++; continue; }

  const baynaMatch = t.match(/^بين يدي الباب\s+(الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع)$/);
  if (baynaMatch) { skippedSpecial++; continue; }

  if (/^مقد[ّةَ]+ الكتاب$/.test(t)) { skippedSpecial++; continue; }
  if (t === "تنويه") { skippedSpecial++; continue; }

  if (seenHeading.has(h.num)) { skippedDuplicate++; continue; }
  
  const m = t.match(numRe);
  if (m) {
    seenHeading.add(m[1]);
    foundIndices.add(h.i);
  }
}

console.log(`\nSimulated parser would find: ${foundIndices.size}`);
console.log(`  Skipped book titles: ${skippedBookTitle}`);
console.log(`  Skipped special sections: ${skippedSpecial}`);
console.log(`  Skipped duplicates: ${skippedDuplicate}`);

const missed = contentHeadings.filter(h => !foundIndices.has(h.i));
console.log(`  Missed (unknown reason): ${missed.length}`);

console.log(`\nFirst 30 missed headings:`);
missed.slice(0, 30).forEach(h => {
  const text = getText(pMatches[h.i]).trim();
  console.log(`  [${h.i}] num=${h.num} bold=${h.bold} listItem=${h.listItem} text="${text.substring(0, 60)}"`);
});

console.log(`\nLast 10 missed headings:`);
missed.slice(-10).forEach(h => {
  const text = getText(pMatches[h.i]).trim();
  console.log(`  [${h.i}] num=${h.num} bold=${h.bold} listItem=${h.listItem} text="${text.substring(0, 60)}"`);
});
