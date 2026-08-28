import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { siteConfig } from "@/data/site";
import { getStats } from "@/lib/content";

export async function Footer() {
  const stats = getStats();
  return (
    <footer className="mt-auto border-t border-line bg-paper-deep/50">
      <div className="mx-auto max-w-[1400px] px-6 py-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <Link href="/" className="font-amiri text-2xl font-bold text-accent">
            {siteConfig.shortName}
          </Link>
          <p className="max-w-xl font-amiri text-xl italic leading-relaxed text-ink-soft">
            {siteConfig.workTitle}
          </p>
          <p className="font-kufi text-sm text-ink-soft">
            تأليف{" "}
            <Link
              href={siteConfig.aboutPath}
              className="font-semibold text-accent transition-colors hover:text-accent-bright"
            >
              {siteConfig.author}
            </Link>{" "}
            — {siteConfig.attributionPlace} {siteConfig.attributionYear}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-kufi text-xs text-ink-faint">
            <span>{stats.books} أبواب</span>
            <span aria-hidden>·</span>
            <span>{stats.sections} مبحثاً</span>
            <span aria-hidden>·</span>
            <span>~{Math.round(stats.words / 1000)} ألف كلمة</span>
          </div>
          <div className="mt-2 font-kufi text-xs text-ink-faint">
            مشروعٌ مفتوحٌ للتدبّر القرآنيّ · مطروحٌ للنقاش والنقد العلميّ
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-kufi text-xs">
            <a
              href={siteConfig.orcid}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent transition-colors hover:text-accent-bright"
            >
              ORCID
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
            <span aria-hidden className="text-ink-faint">·</span>
            <a
              href={siteConfig.scholar}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent transition-colors hover:text-accent-bright"
            >
              Google Scholar
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
            <span aria-hidden className="text-ink-faint">·</span>
            <a
              href={siteConfig.academia}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent transition-colors hover:text-accent-bright"
            >
              Academia.edu
              <ExternalLink className="h-3 w-3" aria-hidden />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
