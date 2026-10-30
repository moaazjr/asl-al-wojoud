const QURAN_SPAN_RE = /﴿[^﴾]*﴾/g;

const UTHMANI_RULES: ReadonlyArray<readonly [RegExp, string]> = [
  [/الصَّلَاةَ/g, "الصَّلَوٰةَ"],
  [/الصَّلَاةِ/g, "الصَّلَوٰةِ"],
  [/الصَّلَاةُ/g, "الصَّلَوٰةُ"],
  [/الزَّكَاةَ/g, "الزَّكَوٰةَ"],
  [/الزَّكَاةِ/g, "الزَّكَوٰةِ"],
  [/الْحَيَاةَ/g, "ٱلْحَيَوٰةَ"],
  [/الْحَيَاةِ/g, "ٱلْحَيَوٰةِ"],
  [/الْحَيَاةُ/g, "ٱلْحَيَوٰةُ"],
  [/الرِّبَا/g, "ٱلرِّبَوٰا"],
  [/الْغَدَاةَ/g, "ٱلْغَدَوٰةَ"],
  [/الْغَدَاةِ/g, "ٱلْغَدَوٰةِ"],
  [/النَّجَاةَ/g, "ٱلنَّجَوٰةَ"],
  [/النَّجَاةِ/g, "ٱلنَّجَوٰةِ"],
  [/صَلَاةِ/g, "صَلَوٰةِ"],
  [/أَصَلَاتُكَ/g, "أَصَلَوٰتُكَ"],
];

function applyRules(span: string): string {
  return UTHMANI_RULES.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    span,
  );
}

export function toUthmaniQuranSpans(text: string): string {
  if (!text.includes("﴿")) return text;
  return text.replace(QURAN_SPAN_RE, applyRules);
}
