import AdmZip from "adm-zip";
const zip = new AdmZip("أصل الوجود — النسخة المحسنة.docx");
const xml = zip.readAsText("word/document.xml", "utf8");
const matches = xml.match(/<w:p[ >].*?<\/w:p>/gs) || [];
const paras = matches.map((pxml, idx) => {
  const bold = /<w:b[\s/>]/.test(pxml) && !/w:val="0"/.test(pxml);
  const rStyleAb = /<w:rStyle\s+w:val="ab"/.test(pxml);
  const bigFont = /<w:sz\s+w:val="(2[89]|3\d|4\d)"/.test(pxml);
  const headingStyle = bold || rStyleAb || bigFont;
  const textParts = [];
  const tokenRe = /<w:t[^>]*>([^<]*)<\/w:t>|<w:tab[^>]*\/?>/g;
  let m;
  while ((m = tokenRe.exec(pxml)) !== null) {
    if (m[0].startsWith("<w:tab")) textParts.push("\t");
    else textParts.push(m[1]);
  }
  return { text: textParts.join("").trim(), headingStyle, idx };
}).filter(p => p.text.length > 0);

// Find TOC end
let lastTocIdx = 0;
for (let i = 0; i < paras.length; i++) {
  if (paras[i].text.includes("\t") && /^\d+\.\d+/.test(paras[i].text)) lastTocIdx = i;
}

// Now look at content after TOC
const contentParas = paras.slice(lastTocIdx + 1);
console.log("Content paragraphs:", contentParas.length);

// Find all bold paragraphs in content that look like headings
const numRe = /^(\d+(?:\.\d+)+)(?:\s*[-\u2013\u2014:\s])*(.*)$/;
const contentHeadings = contentParas.filter(p => numRe.test(p.text));
console.log("Content paragraphs matching numRe:", contentHeadings.length);
contentHeadings.forEach(p => console.log(p.idx + (p.headingStyle ? " [H]" : "") + ": " + p.text.substring(0, 200)));
