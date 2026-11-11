import { createHash } from "node:crypto";

export interface LastmodEntry {
  hash: string;
  date: string;
}

export type LastmodMap = Record<string, LastmodEntry>;

interface HashableSection {
  slug: string;
  title?: string;
  desc?: string;
  blocks?: unknown;
}

export function sectionHash(section: HashableSection): string {
  const payload = JSON.stringify({
    title: section.title ?? "",
    desc: section.desc ?? "",
    blocks: section.blocks ?? [],
  });
  return createHash("sha1").update(payload).digest("hex").slice(0, 16);
}

export function updateLastmod(
  previous: LastmodMap,
  sections: HashableSection[],
  today: string,
): LastmodMap {
  const next: LastmodMap = {};
  for (const section of sections) {
    const hash = sectionHash(section);
    const prior = previous[section.slug];
    next[section.slug] = prior && prior.hash === hash ? prior : { hash, date: today };
  }
  return next;
}

export function latestDateFor(map: LastmodMap, slug: string): string | undefined {
  let latest: string | undefined;
  for (const [key, entry] of Object.entries(map)) {
    if (key !== slug && !key.startsWith(`${slug}-`)) continue;
    if (!latest || entry.date > latest) latest = entry.date;
  }
  return latest;
}

export function latestDate(map: LastmodMap): string | undefined {
  let latest: string | undefined;
  for (const entry of Object.values(map)) {
    if (!latest || entry.date > latest) latest = entry.date;
  }
  return latest;
}
