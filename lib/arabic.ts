const DIACRITICS =
  /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0640]/g;

export function normalizeArabic(text: string): string {
  return text
    .replace(DIACRITICS, "")
    .replace(/[\u0623\u0625\u0622]/g, "\u0627")
    .replace(/\u0649/g, "\u064A")
    .replace(/\u0624/g, "\u0648")
    .replace(/\u0626/g, "\u064A")
    .replace(/\u0629/g, "\u0647")
    .toLowerCase()
    .trim();
}

const VARIANT_MAP: Record<string, string> = {
  "\u0627": "[\u0627\u0623\u0625\u0622]",
  "\u064A": "[\u064A\u0649]",
  "\u0647": "[\u0647\u0629]",
  "\u0648": "[\u0648\u0624]",
};

const TASHKEEL_OPT =
  "[\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06DC\\u06DF-\\u06E8\\u06EA-\\u06ED\\u0640]*";

export function buildSearchRegex(query: string): RegExp {
  const normalized = normalizeArabic(query).trim();
  if (!normalized) return /\b\B/;
  const tokens = normalized.split(/\s+/).filter(Boolean).slice(0, 5);
  if (tokens.length === 0) return /\b\B/;
  const tokenPatterns = tokens.map((token) => {
    const classes = [...token].map((ch) => {
      const cls = VARIANT_MAP[ch];
      if (cls) return cls;
      return ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    });
    return classes.join(TASHKEEL_OPT);
  });
  const fullPattern = tokenPatterns.join(`${TASHKEEL_OPT}\\s+${TASHKEEL_OPT}`);
  return new RegExp(`(${fullPattern})`, "gi");
}

export function extractSnippet(
  text: string,
  query: string,
  maxLen = 130,
): string {
  if (!query.trim()) return text.slice(0, maxLen);
  const regex = buildSearchRegex(query);
  const match = regex.exec(text);
  if (!match) return text.slice(0, maxLen);
  const matchStart = match.index;
  const matchEnd = match.index + match[0].length;
  const context = Math.max(0, Math.floor((maxLen - (matchEnd - matchStart)) / 2));
  const start = Math.max(0, matchStart - context);
  const end = Math.min(text.length, matchEnd + context);
  let snippet = text.slice(start, end);
  if (start > 0) snippet = "\u2026" + snippet;
  if (end < text.length) snippet += "\u2026";
  return snippet;
}
