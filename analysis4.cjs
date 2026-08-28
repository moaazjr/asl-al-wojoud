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

// Find last book boundary
let lastBookBoundary = 0;
cp = paras;
for (let i = cp.length - 1; i >= 0; i--) {
  if (/^الباب\s+(الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع)$/.test(cp[i].text) ||
      /خاتمة الباب\s+(الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع)/.test(cp[i].text) ||
      /بين يدي الباب\s+(الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع)/.test(cp[i].text)) {
    lastBookBoundary = i;
    break;
  }
}

console.log("Last book boundary paragraph index:", lastBookBoundary, cp[lastBookBoundary].text.substring(0, 100));
console.log("\n=== Content after last book boundary ===");
cp.slice(lastBookBoundary).forEach(p => {
  const flags = [];
  if (p.bold) flags.push("B");
  if (p.bigFont) flags.push("BIG");
  console.log(p.idx + (flags.length ? " [" + flags.join(",") + "]" : "") + ": " + p.text.substring(0, 200));
});

// Also check the "خاتمة الكتاب" section
console.log("\n=== Content around خاتمة الكتاب ===");
const khatamIdx = cp.findIndex(p => p.text.startsWith("خاتمة الكتاب") && !p.text.includes("\t"));
if (khatamIdx >= 0) {
  cp.slice(khatamIdx, khatamIdx + 10).forEach(p => {
    const flags = [];
    if (p.bold) flags.push("B");
    if (p.bigFont) flags.push("BIG");
    console.log(p.idx + (flags.length ? " [" + flags.join(",") + "]" : "") + ": " + p.text.substring(0, 200));
  });
}

// Also look for "مقدّمة الكتاب" and "تمهيد" sections at the start
console.log("\n=== Content between تمهيد and first book ===");
const tamhidIdx = cp.findIndex(p => p.text === "تمهيد" || p.text === "مقدّمة الكتاب" || p.text === "مقدمة الكتاب");
if (tamhidIdx >= 0) {
  cp.slice(tamhidIdx, tamhidIdx + 5).forEach(p => {
    const flags = [];
    if (p.bold) flags.push("B");
    if (p.bigFont) flags.push("BIG");
    console.log(p.idx + (flags.length ? " [" + flags.join(",") + "]" : "") + ": " + p.text.substring(0, 200));
  });
}
