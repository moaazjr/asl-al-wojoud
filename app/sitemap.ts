import type { MetadataRoute } from "next";
import { statSync } from "node:fs";
import { resolve } from "node:path";
import { getAllChapterSlugs, getToc } from "@/lib/content";
import { siteConfig } from "@/data/site";

function contentLastModified(): Date {
  try {
    return statSync(resolve(process.cwd(), "data/generated/toc.json")).mtime;
  } catch {
    return new Date(siteConfig.datePublished);
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const lastModified = contentLastModified();
  const staticPages: [string, number][] = [
    ["/", 1],
    ["/toc", 0.9],
    ["/method", 0.8],
    ["/about-project", 0.7],
    ["/how-to-read", 0.7],
    ["/author", 0.7],
    ["/subject-index", 0.7],
    ["/limits", 0.6],
    ["/cite", 0.6],
    ["/faq", 0.6],
    ["/contact", 0.5],
    ["/ask", 0.5],
  ];

  const routes: MetadataRoute.Sitemap = staticPages.map(([path, priority]) => ({
    url: `${base}${path}`,
    lastModified,
    priority,
    changeFrequency: "monthly",
  }));

  for (const book of getToc()) {
    routes.push({
      url: `${base}/${book.number}`,
      lastModified,
      priority: 0.8,
      changeFrequency: "monthly",
    });
  }

  for (const { bookNumber, slug } of getAllChapterSlugs()) {
    routes.push({
      url: `${base}/${bookNumber}/${slug}`,
      lastModified,
      priority: 0.7,
      changeFrequency: "monthly",
    });
  }

  return routes;
}
