import AdmZip from "adm-zip";
const zip = new AdmZip("أصل الوجود — النسخة المحسنة.docx");
const xml = zip.readAsText("word/document.xml", "utf8");
const matches = xml.match(/<w:p[ >].*?<\/w:p>/gs) || [];
const paras = matches.map((pxml, idx) => { const textParts = []; const tokenRe = /<w:t[^>]*>([^<]*)<\/w:t>|<w:tab[^>]*\/?>/g; let m; while ((m = tokenRe.exec(pxml)) !== null) { if (m[0].startsWith("<w:tab")) textParts.push("\t"); else textParts.push(m[1]); } return { text: textParts.join("\").trim(), idx }; }).filter(p => p.text.length > 0);
let lastTocIdx = 0;
for (let i = 0; i < paras.length; i++) { if (paras[i].text.includes("\t") && /^\\d+\\.\\d+/.test(paras[i].text)) lastTocIdx = i; }
const contentParas = paras.slice(lastTocIdx + 1);
const numRe = /^(\\d+(?:\\.\\d+)+)/;
const numberedHeadings = contentParas.filter(p => numRe.test(p.text));
console.log("Total numbered headings in content:", numberedHeadings.length);
const byBook = {};
numberedHeadings.forEach(p => { const m = p.text.match(numRe); if (m) { const bn = m[1].split(".")[0]; if (!byBook[bn]) byBook[bn] = 0; byBook[bn]++; } });
console.log("By book:", byBook);
console.log("\n--- Book boundary sections ---");
contentParas.forEach(p => { if (p.text.includes("بين يدي") || p.text.includes("خاتمة الباب")) console.log(p.idx + ": " + p.text.substring(0, 200)); });
console.log("\n--- Before first numbered heading ---");
const firstNum = contentParas.findIndex(p => numRe.test(p.text));
contentParas.slice(Math.max(0, firstNum-5), firstNum+3).forEach(p => console.log(p.idx + ": " + p.text.substring(0, 200)));