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
console.log("--- Content area 300-400 ---");
paras.slice(300, 400).forEach(p => console.log(p.idx + ": " + p.text.substring(0, 200)));