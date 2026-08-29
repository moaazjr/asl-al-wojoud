import { FadeIn } from "@/components/ui/motion";

const stances = [
  {
    num: "٠١",
    eyebrow: "موقف",
    title: "قراءةٌ بعيون الماضي",
    body: "أن يُحال السائل إلى ما دُوّن في القرون الأولى، فيصير فهم الأقدمين هو المرآة التي لا يُرى النصّ إلا من خلالها.",
  },
  {
    num: "٠٢",
    eyebrow: "موقف",
    title: "تحرّرٌ بلا قاعدة",
    body: "أن يدّعي صاحبه التحرّر من تلك الأفهام، فيرفع شعاراً ولا يطبّقه على نفسه، ويُسقط على النصّ مفهومه هو فيراه فيه.",
  },
  {
    num: "٠٣",
    eyebrow: "موقف",
    title: "التدبّر المنضبط بقواعده",
    body: "لا يُسقِط على النصّ رأياً، ولا يحمل إليه فهماً يسير به في قراءته؛ بل يَدَع النصَّ هو الذي يقوده، حيث تأخذه مقاصدُه.",
  },
];

export function HomeFeatureCards() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="grid gap-6 md:grid-cols-3">
          {stances.map((stance, i) => (
            <FadeIn key={stance.num} delay={i * 0.06} as="div">
              <article className="flex h-full flex-col rounded-2xl border border-line bg-card p-8 transition-shadow hover:shadow-soft">
                <div className="mb-6 flex items-center justify-between">
                  <span className="font-kufi text-sm font-semibold tracking-widest text-accent">
                    {stance.num}
                  </span>
                  <span className="font-kufi text-xs text-ink-faint">
                    {stance.eyebrow}
                  </span>
                </div>
                <h3 className="mb-3 font-amiri text-xl font-bold leading-snug text-ink">
                  {stance.title}
                </h3>
                <p className="leading-relaxed text-ink-soft">{stance.body}</p>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
