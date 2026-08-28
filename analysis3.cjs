const AdmZip = require("adm-zip");
const zip = new AdmZip("أصل الوجود — النسخة المحسنة.docx");
const xml = zip.readAsText("word/document.xml", "utf8");
const matches = xml.match(/<w:p[ >].*?<\/w:p>/gs) || [];

const paras = [];
for (let i = 0; i < matches.length; i++) {
  const pxml = matches[i];
  const bold = /<w:b[\s/>]/.test(pxml);
  const bigFont = /<w:sz\s+w:val="(2[89]|3\d|4\d)"/.test(pxml);
  const tp = [];
  const tr = /<w:t[^>]*>([^<]*)<\/w:t>|<w:tab[^>]*\/?>/g;
  let m;
  while ((m = tr.exec(pxml)) !== null) {
    if (m[0].startsWith("<w:tab")) tp.push("\t");
    else tp.push(m[1]);
  }
  const text = tp.join("").trim();
  if (text.length > 0) paras.push({ text, bold, bigFont, idx: i });
}

// Find TOC end
let lastTocIdx = 0;
for (let i = 0; i < paras.length; i++) {
  if (paras[i].text.includes("\t") && /^\d+\.\d+/.test(paras[i].text)) lastTocIdx = i;
}

console.log("=== TOC section: indices 0 to", lastTocIdx, "===");

const cp = paras.slice(lastTocIdx + 1);
console.log("Content paragraphs:", cp.length);

// Show first 50 content paragraphs
console.log("\n=== First 50 content paragraphs ===");
cp.slice(0, 50).forEach(p => {
  const flags = [];
  if (p.bold) flags.push("BOLD");
  if (p.bigFont) flags.push("BIG");
  console.log(p.idx + (flags.length ? " [" + flags.join(",") + "]" : "") + ": " + p.text.substring(0, 200));
});

// Find all book boundaries
console.log("\n=== Book boundaries ===");
const numRe = /^(\d+(?:\.\d+)+)/;
cp.forEach(p => {
  if (/^الباب\s/.test(p.text) || /بين يدي/.test(p.text) || /خاتمة الباب/.test(p.text) || /خاتمة الكتاب/.test(p.text)) {
    const flags = [];
    if (p.bold) flags.push("BOLD");
    if (p.bigFont) flags.push("BIG");
    console.log(p.idx + (flags.length ? " [" + flags.join(",") + "]" : "") + ": " + p.text.substring(0, 200));
  }
});

// Show the content between "بين يدي الباب الأول" and "1.1"
console.log("\n=== Content around book 1 start ===");
const idx1 = cp.findIndex(p => p.text === "بين يدي الباب الأول");
if (idx1 >= 0) {
  cp.slice(idx1, idx1 + 15).forEach(p => {
    const flags = [];
    if (p.bold) flags.push("BOLD");
    if (p.bigFont) flags.push("BIG");
    console.log(p.idx + (flags.length ? " [" + flags.join(",") + "]" : "") + ": " + p.text.substring(0, 200));
  });
}

// Show content around first numbered heading
console.log("\n=== Content around first numbered heading ===");
const firstNum = cp.findIndex(p => numRe.test(p.text));
if (firstNum >= 0) {
  cp.slice(Math.max(0, firstNum - 3), firstNum + 5).forEach(p => {
    const flags = [];
    if (p.bold) flags.push("BOLD");
    if (p.bigFont) flags.push("BIG");
    console.log(p.idx + (flags.length ? " [" + flags.join(",") + "]" : "") + ": " + p.text.substring(0, 200));
  });
}

// Check how many numbered headings are bold vs non-bold
const numbered = cp.filter(p => numRe.test(p.text));
const boldNum = numbered.filter(p => p.bold || p.bigFont);
const nonBoldNum = numbered.filter(p => !p.bold && !p.bigFont);
console.log("\n=== Heading statistics ===");
console.log("Total numbered headings:", numbered.length);
console.log("Bold/big:", boldNum.length);
console.log("Non-bold:", nonBoldNum.length);

// Show first 5 bold headings and first 5 non-bold
console.log("\nBold headings (first 10):");
boldNum.slice(0, 10).forEach(p => console.log("  " + p.idx + ": " + p.text.substring(0, 150)));
console.log("\nNon-bold headings (first 10):");
nonBoldNum.slice(0, 10).forEach(p => console.log("  " + p.idx + ": " + p.text.substring(0, 150)));
