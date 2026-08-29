import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import { getBabs } from "@/lib/content";

export function HomeChapters() {
  const books = getBabs();

  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <FadeIn>
          <header className="mx-auto max-w-2xl text-center">
            <span className="font-kufi text-xs font-medium tracking-[0.25em] text-accent-bright">
              أبواب الكتاب
            </span>
            <h2 className="mt-4 font-amiri text-3xl font-bold leading-snug text-ink sm:text-4xl">
              سبعة أبواب في قوس واحد متصل
            </h2>
            <p className="mt-4 leading-relaxed text-ink-soft">
              من المصدر إلى المصير — يبني بعضها على بعض، ولا يستقيم فهمُ أوّلها
              إلا بآخرها.
            </p>
          </header>
        </FadeIn>

        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {books.map((book, i) => {
            const isLast = i === books.length - 1;
            const desc =
              book.number === 7
                ? "يجمع المفاتيح الخمسة عشر في موضعٍ واحد"
                : `يضمّ ${book.sectionCount} مبحثاً`;
            return (
              <FadeIn
                key={book.number}
                delay={i * 0.05}
                as="div"
                className={isLast ? "md:col-span-2" : undefined}
              >
                <Link
                  href={`/${book.slug}`}
                  className="group flex h-full items-center gap-5 rounded-2xl border border-line bg-card p-7 transition-all hover:border-accent-bright hover:shadow-soft"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent font-kufi text-2xl font-bold text-paper">
                    {book.titleArabic}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-kufi text-ink-faint">
                      {book.number === 1
                        ? "الباب الأول"
                        : book.number === 2
                          ? "الباب الثاني"
                          : book.number === 3
                            ? "الباب الثالث"
                            : book.number === 4
                              ? "الباب الرابع"
                              : book.number === 5
                                ? "الباب الخامس"
                                : book.number === 6
                                  ? "الباب السادس"
                                  : "الباب السابع"}
                    </span>
                    <span className="mt-1 block font-amiri text-xl font-bold leading-snug text-ink transition-colors group-hover:text-accent">
                      {book.titleOnly}
                    </span>
                    <span className="mt-1 block font-kufi text-sm text-ink-soft">
                      {desc}
                    </span>
                  </span>
                  <ArrowLeft
                    className="h-5 w-5 shrink-0 text-accent transition-transform group-hover:-translate-x-1"
                    aria-hidden
                  />
                </Link>
              </FadeIn>
            );
          })}
        </div>
      </div>
    </section>
  );
}
