import Link from "next/link";
import { BookOpen } from "lucide-react";
import { FullBookDownloadButton } from "@/components/analytics/full-book-download-button";

export function ChapterIntroBanner() {
  return (
    <aside
      aria-label="معلومات عن الكتاب"
      className="mt-6 flex flex-col gap-3 rounded-xl border border-line bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="font-naskh text-sm leading-loose text-ink-soft">
        هذا الفصل من كتاب{" "}
        <span className="font-amiri font-bold text-ink">«أصل الوجود»</span> —
        قراءة في القرآن بالقرآن.
      </p>
      <div className="flex flex-wrap gap-2">
        <FullBookDownloadButton className="px-4 py-2 text-xs">
          تحميل الكتاب
        </FullBookDownloadButton>
        <Link
          href="/1/1-1"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-accent px-4 py-2 font-kufi text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <BookOpen className="h-3.5 w-3.5" aria-hidden />
          ابدأ من الفصل الأول
        </Link>
      </div>
    </aside>
  );
}
