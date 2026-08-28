const AdmZip = require("adm-zip");
const zip = new AdmZip("أصل الوجود — النسخة المحسنة.docx");
const xml = zip.readAsText("word/document.xml", "utf8");
const matches = xml.match(/<w:p[ >].*?<\/w:p>/gs) || [];
const paras = matches.map((pxml, idx) => { const tp = []; const tr = /<w:t[^>]*>([^<]*)<\/w:t>|<w:tab[^>]*\/?>/g; let m; while ((m = tr.exec(pxml)) !== null) { if (m[0].startsWith("<w:tab")) tp.push("\t"); else tp.push(m[1]); } return { text: tp.join("\").trim(), idx }; }).filter(p => p.text.length > 0);
let lastTocIdx = 0;
for (let i = 0; i < paras.length; i++) { if (paras[i].text.includes("\t") && /^\d+\.\d+/.test(paras[i].text)) lastTocIdx = i; }
const cp = paras.slice(lastTocIdx + 1);
const nr = /^(\d+(?:\.\d+)+)/;
const nh = cp.filter(p => nr.test(p.text));
console.log("Headings:", nh.length);
const bb = {};
nh.forEach(p => { const m = p.text.match(nr); if (m) { const bn = m[1].split(".")[0]; bb[bn] = (bb[bn]||0)+1; } });
console.log("By book:", bb);
console.log("Boundaries:");
cp.forEach(p => { if (p.text.includes("بين يدي") || p.text.includes("خاتمة الباب")) console.log(p.idx + ": " + p.text.substring(0, 150)); });