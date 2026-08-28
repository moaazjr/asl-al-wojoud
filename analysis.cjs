const AdmZip = require("adm-zip");
const zip = new AdmZip("أصل الوجود — النسخة المحسنة.docx");
const xml = zip.readAsText("word/document.xml", "utf8");
const matches = xml.match(/<w:p[ >].*?<\/w:p>/gs) || [];
const paras = [];
for (let i = 0; i < matches.length; i++) {
  const pxml = matches[i];
  const tp = [];
  const tr = /<w:t[^>]*>([^<]*)<\/w:t>|<w:tab[^>]*\/?>/g;
  let m;
  while ((m = tr.exec(pxml)) !== null) {
    if (m[0].startsWith("<w:tab")) tp.push("\t");
    else tp.push(m[1]);
  }
  const text = tp.join("").trim();
  if (text.length > 0) paras.push({ text, idx: i });
}
let lastTocIdx = 0;
for (let i = 0; i < paras.length; i++) {
  if (paras[i].text.includes("\t") && /^\d+\.\d+/.test(paras[i].text)) lastTocIdx = i;
}
const cp = paras.slice(lastTocIdx + 1);
const nr = /^(\d+(?:\.\d+)+)/;
const nh = cp.filter(p => nr.test(p.text));
console.log("Headings:", nh.length);
const bb = {};
nh.forEach(p => {
  const m = p.text.match(nr);
  if (m) {
    const bn = m[1].split(".")[0];
    bb[bn] = (bb[bn] || 0) + 1;
  }
});
console.log("By book:", bb);
console.log("\nBoundaries:");
cp.forEach(p => {
  if (p.text.includes("\u0628\u064a\u0646 \u064a\u062f\u064a") || p.text.includes("\u062e\u0627\u062a\u0645\u0629 \u0627\u0644\u0628\u0627\u0628"))
    console.log(p.idx + ": " + p.text.substring(0, 150));
});
console.log("\nFirst 5 before numbered heading:");
const fn = cp.findIndex(p => nr.test(p.text));
cp.slice(Math.max(0, fn - 5), fn + 3).forEach(p => console.log(p.idx + ": " + p.text.substring(0, 150)));
