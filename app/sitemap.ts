import type { MetadataRoute } from "next";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getAllChapterSlugs, getToc } from "@/lib/content";
import { latestDate, latestDateFor, type LastmodMap } from "@/lib/content-lastmod";
import { siteConfig } from "@/data/site";

function loadLastmod(): LastmodMap {
  try {
    return JSON.parse(
      readFileSync(resolve(process.cwd(), "data/generated/lastmod.json"), "utf8"),
    );
  } catch {
    return {};
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const lastmod = loadLastmod();
  const contentLatest = latestDate(lastmod);
  const withContentDate = new Set(["/", "/toc"]);
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
    lastModified: withContentDate.has(path) ? contentLatest : undefined,
    priority,
    changeFrequency: "monthly",
  }));

  const chapters = getAllChapterSlugs();

  for (const book of getToc()) {
    const chapterDates = chapters
      .filter((c) => c.bookNumber === book.number)
      .map((c) => latestDateFor(lastmod, c.slug))
      .filter((d): d is string => Boolean(d))
      .sort();
    routes.push({
      url: `${base}/${book.number}`,
      lastModified: chapterDates.at(-1),
      priority: 0.8,
      changeFrequency: "monthly",
    });
  }

  for (const { bookNumber, slug } of chapters) {
    routes.push({
      url: `${base}/${bookNumber}/${slug}`,
      lastModified: latestDateFor(lastmod, slug),
      priority: 0.7,
      changeFrequency: "monthly",
    });
  }

  return routes;
}
