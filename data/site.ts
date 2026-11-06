const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
  "https://asl-al-wojoud.io"
).replace(/\/+$/, "");

export const siteConfig = {
  title: "أصل الوجود",
  shortName: "أصل الوجود",
  tagline: "منظومةٌ استقرائيةٌ في تدبّر كتاب الله",
  subtitle: "منظومةٌ في التدبّر القرآنيّ",
  description:
    "قراءةٌ داخليةٌ للقرآن تستنطق بنيته من داخله، تُعيد تعريف مفاهيمه الكبرى من نسيجه نفسه، وتردّ كلَّ لفظٍ إلى مصدره ومقامه.",
  author: "منذر الصبّاغ",
  authorEn: "Monzer Alsabbagh",
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() ||
    "contact@asl-al-wojoud.vercel.app",
  orcid: "https://orcid.org/0009-0005-2410-6437",
  scholar: "https://scholar.google.com/citations?user=kZ09vkgAAAAJ",
  academia: "https://independent.academia.edu/MonzerAlsabbagh",
  workTitle: "أصل الوجود: قراءةٌ منهجيةٌ للقرآن من داخله، من المصدر إلى المصير",
  attributionPlace: "دمشق",
  attributionYear: "٢٠٢٦",
  aboutPath: "/author",
  datePublished: "2026-08-09",
  pages: 656,
  bookWords: 345412,
  doi: "https://doi.org/10.5281/zenodo.21855463",
  url: siteUrl,
  seoTitle: "أصل الوجود — قراءة منهجية للقرآن الكريم من داخله",
  keywords: [
    "أصل الوجود",
    "كتاب أصل الوجود",
    "منذر الصبّاغ",
    "منذر الصباغ",
    "التدبّر القرآني",
    "تدبر القرآن",
    "القرآن الكريم",
    "تفسير القرآن",
    "التفسير الموضوعي",
    "المنظومة القرآنية",
    "قراءة القرآن من داخله",
    "الاستقراء القرآني",
    "لا ترادف في القرآن",
    "Asl Al-Wujud",
    "Monzer Alsabbagh",
  ],
  nav: [
    { label: "الرئيسية", href: "/" },
    { label: "الفهرس العام", href: "/toc" },
  ],
} as const;

export const readingStats = {
  books: 7,
  sections: 715,
  words: 345412,
};
