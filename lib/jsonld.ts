import { siteConfig } from "@/data/site";

const authorId = `${siteConfig.url}/#author`;
const bookId = `${siteConfig.url}/#book`;
const websiteId = `${siteConfig.url}/#website`;

const author = {
  "@type": "Person",
  "@id": authorId,
  name: siteConfig.author,
  alternateName: siteConfig.authorEn,
  url: `${siteConfig.url}${siteConfig.aboutPath}`,
  identifier: siteConfig.orcid,
  sameAs: [siteConfig.orcid, siteConfig.scholar, siteConfig.academia],
};

export const bookJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: siteConfig.url,
      name: siteConfig.title,
      alternateName: [siteConfig.workTitle, "Asl Al-Wujud"],
      description: siteConfig.description,
      inLanguage: "ar",
      publisher: { "@id": authorId },
    },
    author,
    {
      "@type": "Book",
      "@id": bookId,
      name: siteConfig.workTitle,
      alternateName: siteConfig.title,
      url: siteConfig.url,
      description: siteConfig.description,
      inLanguage: "ar",
      datePublished: siteConfig.datePublished,
      numberOfPages: siteConfig.pages,
      bookFormat: "https://schema.org/EBook",
      isAccessibleForFree: true,
      identifier: siteConfig.doi,
      sameAs: [siteConfig.doi],
      keywords: siteConfig.keywords.join("، "),
      author: { "@id": authorId },
    },
  ],
};

export function chapterJsonLd(input: {
  path: string;
  title: string;
  description: string;
  bookTitle: string;
  bookPath: string;
  wordCount: number;
}) {
  const url = `${siteConfig.url}${input.path}`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Chapter",
        "@id": `${url}#chapter`,
        url,
        name: input.title,
        headline: input.title,
        description: input.description,
        inLanguage: "ar",
        wordCount: input.wordCount,
        isAccessibleForFree: true,
        author: { "@id": authorId },
        isPartOf: { "@id": bookId },
        mainEntityOfPage: url,
      },
      breadcrumbJsonLd([
        { name: siteConfig.title, path: "/" },
        { name: input.bookTitle, path: input.bookPath },
        { name: input.title, path: input.path },
      ]),
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  };
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
