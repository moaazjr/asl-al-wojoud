import { siteConfig } from "@/data/site";

export const bookJsonLd = {
  "@context": "https://schema.org",
  "@type": "Book",
  name: siteConfig.workTitle,
  url: siteConfig.url,
  description: siteConfig.description,
  inLanguage: "ar",
  datePublished: siteConfig.datePublished,
  numberOfPages: siteConfig.pages,
  identifier: siteConfig.doi,
  keywords: [...siteConfig.keywords],
  author: {
    "@type": "Person",
    name: siteConfig.author,
    alternateName: siteConfig.authorEn,
    identifier: siteConfig.orcid,
    sameAs: [siteConfig.orcid, siteConfig.scholar, siteConfig.academia],
  },
};
