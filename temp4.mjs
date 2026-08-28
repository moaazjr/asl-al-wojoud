import AdmZip from "adm-zip";
const zip = new AdmZip("أصل الوجود — النسخة المحسنة.docx");
const xml = zip.readAsText("word/document.xml", "utf8");
const matches = xml.match(/<w:p[ >].*?<\/w:p>/gs) || [];
const paras = matches.map((pxml, idx) => {
  const textParts = [];
  const tokenRe = /<w:t[^>]*>([^<]*)<\/w:t>|<w:tab[^>]*\/?>/g;
  let m;
  while ((m = tokenRe.exec(pxml)) !== null) {
    if (m[0].startsWith("<w:tab")) textParts.push("\t");
    else textParts.push(m[1]);
  }
  return { text: textParts.join("").trim(), idx };
}).filter(p => p.text.length > 0);

// Find where TOC ends
let lastTocIdx = 0;
for (let i = 0; i < paras.length; i++) {
  if (paras[i].text.includes("\t") && /^\d+\.\d+/.test(paras[i].text)) {
    lastTocIdx = i;
  }
}
console.log("Last TOC entry at index:", paras[lastTocIdx].idx, paras[lastTocIdx].text.substring(0, 100));

// Show content after TOC
console.log("\n--- Content starting after TOC (indices " + (lastTocIdx+1) + " to " + (lastTocIdx+20) + ") ---");
paras.slice(lastTocIdx + 1, lastTocIdx + 20).forEach(p => {
  console.log(p.idx + (p.text.includes("\t") ? " [TAB]" : "") + ": " + p.text.substring(0, 300));
});

// Also check for bold paragraphs in the content area
const boldParas = [];
matches.forEach((pxml, idx) => {
  const bold = /<w:b[\s/>]/.test(pxml);
  if (bold && idx > lastTocIdx + 10) {
    const textParts = [];
    const tokenRe = /<w:t[^>]*>([^<]*)<\/w:t>/g;
    let m;
    while ((m = tokenRe.exec(pxml)) !== null) textParts.push(m[1]);
    const text = textParts.join("").trim();
    if (text.length > 5) boldParas.push({ idx, text: text.substring(0, 200) });
  }
});
console.log("\nBold paragraphs in content area (first 30):");
boldParas.slice(0, 30).forEach(p => console.log(p.idx + ": " + p.text));
