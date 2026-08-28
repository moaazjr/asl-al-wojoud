const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DOCX_PATH = path.join(ROOT, "source", "أصل الوجود — النسخة المحسنة.docx");

const zip = new AdmZip(DOCX_PATH);
const xml = zip.readAsText("word/document.xml", "utf8");

const pMatches = xml.match(/<w:p[ >].*?<\/w:p>/gs) ?? [];

function getText(pxml) {
  const parts = [];
  const re = /<w:t[^>]*>([^<]*)<\/w:t>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>/g;
  let m;
  while ((m = re.exec(pxml)) !== null) {
    if (m[0].startsWith("<w:tab")) parts.push("\t");
    else if (m[0].startsWith("<w:br")) parts.push("\n");
    else parts.push(m[1]);
  }
  return parts.join("").trim();
}

function isBold(pxml) {
  return /<w:b(?:\s[^>]*)?\s*\/?>/.test(pxml) && !/w:val="0"/.test(pxml);
}

function isListItem(pxml) {
  return /<w:numPr>/.test(pxml);
}

const numRe = /^(\d+(?:\.\d+)+)(?:\s*[-–—:\sـ])*\s*(.*)$/;

const allNumHeadings = [];
const boldNumHeadings = [];
const nonBoldNumHeadings = [];
const boldNonNumHeadings = [];

for (let i = 0; i < pMatches.length; i++) {
  const t = getText(pMatches[i]);
  if (!t) continue;
  const m = t.match(numRe);
  const bn = m ? parseInt(m[1].split(".")[0], 10) : 0;
  if (m && bn >= 1 && bn <= 7) {
    allNumHeadings.push({ i, num: m[1], title: m[2], bold: isBold(pMatches[i]), listItem: isListItem(pMatches[i]) });
    if (isBold(pMatches[i])) boldNumHeadings.push({ i, num: m[1], title: m[2], listItem: isListItem(pMatches[i]) });
    else nonBoldNumHeadings.push({ i, num: m[1], title: m[2], listItem: isListItem(pMatches[i]) });
  }
  if (isBold(pMatches[i]) && !m) {
    boldNonNumHeadings.push({ i, text: t.substring(0, 80), listItem: isListItem(pMatches[i]) });
  }
}

console.log(`Total numbered headings (books 1-7): ${allNumHeadings.length}`);
console.log(`  Bold: ${boldNumHeadings.length}`);
console.log(`  Non-bold: ${nonBoldNumHeadings.length}`);
console.log(`  Of non-bold: ${nonBoldNumHeadings.filter(h => h.listItem).length} are list items`);
console.log(`  Of non-bold: ${nonBoldNumHeadings.filter(h => !h.listItem).length} are NOT list items`);

console.log(`\nBold non-numbered headings:`);
boldNonNumHeadings.forEach(h => console.log(`  [${h.i}] "${h.text}" listItem=${h.listItem}`));

// Show first 20 non-bold numbered headings to understand them
console.log(`\nFirst 20 non-bold numbered headings:`);
nonBoldNumHeadings.slice(0, 20).forEach(h =>
  console.log(`  [${h.i}] num=${h.num} title="${h.title}" listItem=${h.listItem}`)
);

// Check if any non-bold numbered headings are list items vs not
console.log(`\nSample non-bold, NOT list-item numbered headings:`);
nonBoldNumHeadings.filter(h => !h.listItem).slice(0, 15).forEach(h =>
  console.log(`  [${h.i}] num=${h.num} title="${h.title}"`)
);

// Check the heading count per book
const perBook = {};
allNumHeadings.forEach(h => {
  const bn = parseInt(h.num.split(".")[0]);
  perBook[bn] = (perBook[bn] || 0) + 1;
});
console.log(`\nHeadings per book:`, perBook);

// After TOC, check how many numbered headings are in content area
const TOC_END = 718;
const contentHeadings = allNumHeadings.filter(h => h.i >= TOC_END);
console.log(`\nNumbered headings after TOC (idx >= ${TOC_END}): ${contentHeadings.length}`);
const contentBold = contentHeadings.filter(h => h.bold).length;
const contentNonBold = contentHeadings.filter(h => !h.bold).length;
console.log(`  Bold: ${contentBold}, Non-bold: ${contentNonBold}`);
