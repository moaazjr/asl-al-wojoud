import { FadeIn } from "@/components/ui/motion";

export function HomeQuote() {
  return (
    <section className="border-y border-line-soft bg-paper">
      <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
        <FadeIn>
          <span className="mb-6 flex items-center gap-3 font-kufi text-xs font-medium tracking-[0.25em] text-accent-bright">
            <span className="h-px w-8 bg-accent/40" aria-hidden />
            في المقدّمة
          </span>
          <blockquote className="relative ps-6 sm:ps-10">
            <span
              className="absolute inset-y-0 start-0 w-[3px] rounded-full bg-accent"
              aria-hidden
            />
            <p className="font-amiri text-2xl leading-[2] text-ink sm:text-3xl">
              «قلّما يقرأ اثنان النصّ القرآنيّ فيخرجان منه بفهمٍ واحد، وما ذلك
              لغموضٍ في النصّ، بل لاختلاف المدخل الذي يُؤتى منه.»
            </p>
            <footer className="mt-6 font-kufi text-sm text-ink-faint">
              من مقدّمة كتاب «{""}أصل الوجود{""}»
            </footer>
          </blockquote>
        </FadeIn>
      </div>
    </section>
  );
}
