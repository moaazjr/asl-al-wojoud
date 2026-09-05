import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import { HeroBook } from "@/components/home/hero-book";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/data/site";

export function HomeHero({
  stats,
}: {
  stats: { books: number; sections: number; words: number };
}) {
  const statRow = [
    { n: stats.books, l: "أبواب" },
    { n: stats.sections, l: "مبحثاً" },
    { n: `~${Math.round(stats.words / 1000)}`, l: "ألف كلمة" },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--accent-soft),transparent_62%)]" />
      <div className="relative mx-auto max-w-3xl px-6 pt-4 pb-10 text-center sm:pt-10 sm:pb-28">
        <FadeIn delay={0}>
          <HeroBook />
        </FadeIn>

        <FadeIn delay={0.05}>
          <span className="inline-flex items-center gap-2 font-kufi text-xs font-medium tracking-[0.25em] text-accent-bright">
            <span className="h-px w-6 bg-accent/40" aria-hidden />
            كتاب أصل الوجود
            <span className="h-px w-6 bg-accent/40" aria-hidden />
          </span>
        </FadeIn>

        <FadeIn delay={0.1}>
          <h1 className="mt-6 font-serif text-4xl font-bold leading-tight text-ink sm:text-6xl lg:text-7xl">
            {siteConfig.title}
          </h1>
        </FadeIn>

        <FadeIn delay={0.15}>
          <p className="mx-auto mt-5 max-w-xl font-amiri text-2xl text-accent sm:text-3xl">
            قراءة منهجية للقرآن من داخله
          </p>
        </FadeIn>

        <FadeIn delay={0.2}>
          <p className="mt-5 font-kufi text-sm tracking-wide text-ink-soft">
            {siteConfig.author} — {siteConfig.attributionPlace} {siteConfig.attributionYear}
          </p>
        </FadeIn>

        <FadeIn delay={0.25} className="mt-10">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/1/1-1">
                اقرأ الكتاب
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/about-project">
                <BookOpen className="h-4 w-4" />
                عن المشروع
              </Link>
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <dl className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {statRow.map((s) => (
              <div key={s.l} className="text-center">
                <dd className="font-kufi text-3xl font-bold text-accent sm:text-4xl">
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
  );
}
