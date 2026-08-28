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
let lastTocIdx = 0;
for (let i = 0; i < paras.length; i++) {
  if (paras[i].text.includes("\t") && /^\d+\.\d+/.test(paras[i].text)) lastTocIdx = i;
}
const cp = paras.slice(lastTocIdx + 1);
const numRe = /^\d+\.\d+/;
const boldHeadings = cp.filter(p => (p.bold || p.bigFont) && numRe.test(p.text));
console.log("Bold/big headings:", boldHeadings.length);
boldHeadings.slice(0, 10).forEach(p => console.log(p.idx + " [bold=" + p.bold + " big=" + p.bigFont + "]: " + p.text.substring(0, 120)));
const nonBold = cp.filter(p => !p.bold && !p.bigFont && numRe.test(p.text));
console.log("\nNon-bold numbered:", nonBold.length);
nonBold.slice(0, 10).forEach(p => console.log(p.idx + ": " + p.text.substring(0, 120)));