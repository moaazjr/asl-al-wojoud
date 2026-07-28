import Link from "next/link";
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
          <p className="max-w-xl font-kufi text-sm leading-relaxed text-ink-soft">
            {siteConfig.description}
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
        </div>
      </div>
    </footer>
  );
}
