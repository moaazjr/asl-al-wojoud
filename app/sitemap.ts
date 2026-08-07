import type { MetadataRoute } from "next";
import { getAllChapterSlugs, getToc } from "@/lib/content";
import { siteConfig } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const routes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date(), priority: 1, changeFrequency: "monthly" },
    { url: `${base}/toc`, lastModified: new Date(), priority: 0.9, changeFrequency: "monthly" },
  ];

  for (const book of getToc()) {
    routes.push({
      url: `${base}/${book.slug}`,
      lastModified: new Date(),
      priority: 0.8,
      changeFrequency: "monthly",
    });
  }

  for (const { bookNumber, slug } of getAllChapterSlugs()) {
    routes.push({
      url: `${base}/${bookNumber}/${slug}`,
      lastModified: new Date(),
      priority: 0.7,
      changeFrequency: "monthly",
    });
  }

  return routes;
}
