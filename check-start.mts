import AdmZip from "adm-zip";
import { resolve } from "node:path";

const DOCX_PATH = resolve(import.meta.dirname, "source", "أصل الوجود — النسخة المحسنة.docx");

const zip = new AdmZip(DOCX_PATH);
const xml = zip.readAsText("word/document.xml", "utf8");

const pMatches = xml.match(/<w:p[ >].*?<\/w:p>/gs) ?? [];

function getText(pxml: string): string {
  const parts: string[] = [];
  const re = /<w:t[^>]*>([^<]*)<\/w:t>|<w:tab\b[^>]*\/>|<w:br\b[^>]*\/>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(pxml)) !== null) {
    if (m[0].startsWith("<w:tab")) parts.push("\t");
    else if (m[0].startsWith("<w:br")) parts.push("\n");
    else parts.push(m[1]);
  }
  return parts.join("").trim();
}

let lastTocIdx = 0;
for (let i = 0; i < pMatches.length; i++) {
  const t = getText(pMatches[i]);
  if (t.includes("\t") && /^\d+\.\d+/.test(t)) lastTocIdx = i;
}

const contentParas = pMatches.slice(lastTocIdx + 1);

console.log(`\n=== First 30 content paragraphs ===`);
for (let i = 0; i < Math.min(30, contentParas.length); i++) {
  const t = getText(contentParas[i]);
  const bold = /<w:b(?:\s[^>]*)?\s*\/?>/.test(contentParas[i]) && !/w:val="0"/.test(contentParas[i]);
  const chars = [...t].slice(0, 10).map(c => `U+${c.codePointAt(0)!.toString(16).padStart(4, '0')}`).join(' ');
  console.log(`[${i}] bold=${bold} "${t.substring(0, 80)}" chars=${chars}`);
}

const testRe = /^مقد[ّةَ]+ الكتاب$/;
console.log(`\n=== Testing مقدّمة الكتاب regex ===`);
for (let i = 0; i < Math.min(30, contentParas.length); i++) {
  const t = getText(contentParas[i]).trim();
  if (t.includes("مقد")) {
    console.log(`[${i}] "${t}"`);
    console.log(`  regex test: ${testRe.test(t)}`);
    const chars = [...t].map(c => `U+${c.codePointAt(0)!.toString(16).padStart(4, '0')}`).join(' ');
    console.log(`  chars: ${chars}`);
  }
}

const baynaRe = /^بين يدي الباب\s+(الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع)$/;
const khatamaRe = /^خاتمة\s+الباب\s+(الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع)$/;
const bookTitleRe = /^الباب\s+(الأول|الثاني|الثالث|الرابع|الخامس|السادس|السابع)$/;

console.log(`\n=== Searching for key markers ===`);
for (let i = 0; i < contentParas.length; i++) {
  const t = getText(contentParas[i]).trim();
  if (t === "خاتمة الكتاب") {
    console.log(`[${i}] "خاتمة الكتاب"`);
    break;
  }
  if (baynaRe.test(t)) console.log(`[${i}] bayna: "${t}"`);
  if (khatamaRe.test(t)) console.log(`[${i}] khatama: "${t}"`);
  if (bookTitleRe.test(t)) console.log(`[${i}] bookTitle: "${t}"`);
}
