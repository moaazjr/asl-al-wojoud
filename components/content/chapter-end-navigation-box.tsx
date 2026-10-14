import Link from "next/link";
import { cn } from "@/lib/utils";
import { FullBookDownloadButton } from "@/components/analytics/full-book-download-button";

const SECONDARY_BUTTON_CLASS =
  "inline-flex w-full items-center justify-center gap-2 rounded-lg border border-accent bg-transparent px-5 py-2.5 font-kufi text-sm font-semibold text-accent transition-colors hover:bg-accent hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card md:w-auto md:min-w-[16rem]";

export function ChapterEndNavigationBox() {
  return (
    <section
      aria-label="متابعة قراءة الكتاب"
      className="mt-12 rounded-2xl border-2 border-accent bg-card p-6 text-center shadow-sm md:p-8"
    >
      <h2 className="font-amiri text-xl font-bold text-ink md:text-2xl">
        هذا الفصل جزء من كتاب «أصل الوجود»
      </h2>
      <p className="mx-auto mt-3 max-w-2xl font-naskh text-sm leading-loose text-ink-soft md:text-base">
        قراءة في القرآن بالقرآن، من خلق الكون إلى الجنة والنار. الكتاب كاملاً
        مجاناً.
      </p>
      <div className="mt-6 flex flex-col items-stretch gap-3 md:flex-row md:flex-wrap md:items-center md:justify-center">
        <FullBookDownloadButton className="w-full md:w-auto md:min-w-[16rem]">
          تحميل الكتاب PDF
        </FullBookDownloadButton>
        <Link href="/1/1-1" className={SECONDARY_BUTTON_CLASS}>
          ابدأ القراءة من الفصل الأول
        </Link>
        <Link href="/toc" className={SECONDARY_BUTTON_CLASS}>
          فهرس الكتاب
        </Link>
      </div>
      <div className="mt-5">
        <Link
          href="/6/6-2"
          className={cn(
            "inline-flex items-center gap-1.5 font-kufi text-sm font-semibold text-accent",
            "transition-colors hover:text-accent-bright focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card",
          )}
        >
          الفصل التالي
          <span aria-hidden>←</span>
        </Link>
      </div>
    </section>
  );
}
