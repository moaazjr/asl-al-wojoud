import { FadeIn } from "@/components/ui/motion";

export function HomeBookQuote() {
  return (
    <section className="border-y border-line-soft bg-paper-deep">
      <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
        <FadeIn>
          <span className="font-kufi text-xs font-medium tracking-[0.25em] text-accent-bright">
            لمن كُتب هذا الكتاب
          </span>
          <blockquote className="mt-8">
            <p className="font-amiri text-3xl font-bold leading-relaxed text-ink sm:text-4xl lg:text-5xl">
              «هذا الكتاب لمن يطلب، لا لمن وصل فاستراح.»
            </p>
          </blockquote>
          <p className="mx-auto mt-8 max-w-2xl leading-relaxed text-ink-soft">
            لمن يرى في كتاب الله صراطاً مستقيماً يُسلَك، لا متاعاً موروثاً
            يُحفَظ كما وُرِث ولا يُسأل عنه. لمن يقرأ القرآن بعين النصّ نفسه،
            يستقري ويتفكّر ويزن المفهوم بميزانه، لا بعين ما ألِف الناس
            وتوارثوه فأمسى عندهم كالمسلَّمات التي لا تُراجَع.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
