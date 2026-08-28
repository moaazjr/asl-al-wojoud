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

// Find where TOC ends - look for "مقدّمة الكتاب" or "تمهيد" as content
let foundTocEnd = false;
for (let i = 100; i < 250; i++) {
  if (paras[i] && (paras[i].text.includes("مقدّمة الكتاب") || paras[i].text.includes("تمهيد") || paras[i].text.includes("مقدمة الكتاب"))) {
    console.log("Potential TOC/content boundary at index " + paras[i].idx + ": " + paras[i].text.substring(0, 200));
    // Show surrounding
    for (let j = Math.max(0, i-5); j < Math.min(paras.length, i+10); j++) {
      console.log("  " + paras[j].idx + ": " + paras[j].text.substring(0, 200));
    }
    console.log("");
  }
}

// Also look for the transition from TOC format to content format
// TOC entries typically have tab + page numbers
console.log("\n--- Looking for content paragraphs around index 100-200 ---");
paras.slice(100, 200).forEach(p => {
  const hasTab = p.text.includes("\t");
  console.log(p.idx + (hasTab ? " [TAB]" : " [NO-TAB]") + ": " + p.text.substring(0, 200));
});
