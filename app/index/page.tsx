import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SectionList } from "@/components/content/section-list";
import { getToc } from "@/lib/content";

export const metadata: Metadata = {
  title: "الفهرس العام",
  description: "الأبواب السبعة بكلّ فصولها ومباحثها في كتاب أصل الوجود.",
  alternates: { canonical: "/index" },
};

export default function IndexPage() {
  const books = getToc();
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8 lg:py-12">
      <Breadcrumbs items={[{ label: "الفهرس العام" }]} />

      <header className="mb-10 border-b border-line pb-8 text-center">
        <span className="font-kufi text-xs font-medium uppercase tracking-[0.2em] text-accent-bright">
          الخريطة الكاملة
        </span>
        <h1 className="mt-3 font-amiri text-4xl font-bold text-ink sm:text-5xl">
          الفهرس العام
        </h1>
        <p className="mx-auto mt-4 max-w-xl leading-loose text-ink-soft">
          الأبواب السبعة بكلّ فصولها ومباحثها. انقر أيّ بابٍ لتصفّح مباحثه، أو
          استخدم البحث في القائمة الجانبية للوصول السريع.
        </p>
      </header>

      <div className="space-y-10">
        {books.map((book) => (
          <section key={book.number}>
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent font-kufi text-lg font-bold text-paper">
                {book.titleArabic}
              </span>
              <h2 className="font-amiri text-2xl font-bold text-ink">
                {book.titleOnly}
              </h2>
            </div>
            <div className="rounded-xl border border-line bg-card px-5">
              <SectionList sections={book.sections} bookNumber={book.number} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
