import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
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
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 sm:py-32 lg:grid-cols-[1fr_auto] lg:px-8">
        <div className="text-center lg:text-start">
          <FadeIn>
            <span className="inline-flex items-center gap-2 font-kufi text-xs font-medium tracking-[0.25em] text-accent-bright">
              <span className="h-px w-6 bg-accent/40" aria-hidden />
              كتاب أصل الوجود
              <span className="h-px w-6 bg-accent/40" aria-hidden />
            </span>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h1 className="mt-6 font-serif text-4xl font-bold leading-tight text-ink sm:text-7xl lg:text-8xl">
              {siteConfig.title}
            </h1>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="mx-auto mt-5 max-w-xl font-amiri text-2xl text-accent sm:text-3xl lg:mx-0">
              قراءة منهجية للقرآن من داخله
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <p className="mt-5 font-kufi text-sm tracking-wide text-ink-soft">
              {siteConfig.author} — {siteConfig.attributionPlace} {siteConfig.attributionYear}
            </p>
          </FadeIn>

          <FadeIn delay={0.2} className="mt-10">
            <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
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

          <FadeIn delay={0.25}>
            <dl className="mt-16 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 lg:justify-start">
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

        <FadeIn delay={0.15} className="mx-auto lg:mx-0">
          <div className="relative w-52 sm:w-64 lg:w-72">
            <div
              className="pointer-events-none absolute -inset-3 rounded-2xl bg-accent/10"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-xl border border-accent/30 bg-card shadow-lift">
              <img
                src="/asl-alwujoud.jpg"
                alt="غلاف كتاب أصل الوجود"
                className="block h-auto w-full"
              />
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
