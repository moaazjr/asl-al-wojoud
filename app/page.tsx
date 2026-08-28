import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";
import { getToc, getStats } from "@/lib/content";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const books = getToc();
  const stats = getStats();

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--accent-soft),transparent_60%)]" />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center sm:py-28">
          <FadeIn>
            <span className="font-kufi text-xs font-medium uppercase tracking-[0.25em] text-accent-bright">
              القرآن يفسّر نفسه
            </span>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 className="mt-5 font-amiri text-6xl font-bold leading-tight text-ink sm:text-7xl">
              {siteConfig.title}
            </h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="mt-3 font-amiri text-2xl italic text-accent">
              {siteConfig.tagline}
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-loose text-ink-soft">
              {siteConfig.description}
            </p>
          </FadeIn>

          <FadeIn delay={0.2} className="mt-8 flex items-center justify-center">
            <div className="relative flex items-center gap-3">
              <span className="h-px w-8 bg-accent-bright/60" />
              <span className="flex h-2 w-2 items-center justify-center rounded-full bg-accent-bright">
                <Sparkles className="h-2.5 w-2.5 text-paper" />
              </span>
              <span className="h-px w-8 bg-accent-bright/60" />
            </div>
          </FadeIn>

          <FadeIn delay={0.25} className="mt-10">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/1/1-1">
                  ابدأ القراءة
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/toc">
                  <BookOpen className="h-4 w-4" />
                  الفهرس العام
                </Link>
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <dl className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {[
                { n: stats.books, l: "أبواب" },
                { n: stats.sections, l: "مبحثاً" },
                { n: `~${Math.round(stats.words / 1000)}`, l: "ألف كلمة" },
              ].map((s) => (
                <div key={s.l} className="text-center">
                  <dd className="font-kufi text-4xl font-bold text-accent">
                    {s.n}
                  </dd>
                  <dt className="mt-1 font-kufi text-sm text-ink-faint">
                    {s.l}
                  </dt>
                </div>
              ))}
            </dl>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <FadeIn>
          <h2 className="mb-2 text-center font-kufi text-sm font-medium uppercase tracking-widest text-accent-bright">
            الأبواب السبعة
          </h2>
          <p className="mb-10 text-center font-amiri text-3xl font-bold text-ink">
            خريطة الكتاب
          </p>
        </FadeIn>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book, i) => (
            <FadeIn key={book.number} delay={i * 0.05} as="div">
              <Link
                href={`/${book.slug}`}
                className="group flex h-full flex-col rounded-xl border border-line bg-card p-6 transition-all hover:-translate-y-1 hover:border-accent-bright hover:shadow-lift"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent font-kufi text-lg font-bold text-paper">
                    {book.titleArabic}
                  </span>
                  <span className="font-kufi text-xs text-ink-faint">
                    {book.sectionCount} مبحثاً
                  </span>
                </div>
                <h3 className="mb-1 font-amiri text-xl font-bold leading-snug text-ink transition-colors group-hover:text-accent">
                  {book.titleOnly}
                </h3>
                <div className="mt-auto flex items-center gap-1 pt-4 font-kufi text-sm text-accent">
                  تصفّح الباب
                  <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>
    </>
  );
}
