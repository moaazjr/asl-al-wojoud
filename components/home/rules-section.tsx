import { FadeIn } from "@/components/ui/motion";

const rules = [
  {
    num: "١",
    title: "الاستقراء الداخليّ",
    body: "القرآن يفسّر بعضه بعضاً. لا يُقرَّر معنىً قبل استقراء مواضعه كافّةً في النصّ نفسه، ولا يُستعار من خارجه.",
  },
  {
    num: "٢",
    title: "لا ترادف",
    body: "لا يُكرّر القرآن ألفاظه عبثاً، ولا يستعمل كلمةً مكان أخرى بلا قصد. فكلُّ لفظةٍ تحمل ظلاًّ دلالياً خاصاً يميّزها عن غيرها وإن قَرُبت منها.",
  },
  {
    num: "٣",
    title: "لا حرف زائد",
    body: "القرآن كتابٌ محكَم، كلُّ حرفٍ فيه مقصودٌ بدقّة. فكلُّ زيادةٍ أو حذفٍ أو اختلافِ حرفٍ بين كلمتين يغيّر المعنى ويضيف بُعداً خاصاً.",
  },
  {
    num: "٤",
    title: "الزوجيّة — المفتاح الأكبر",
    body: "فما من حقيقةٍ فيه إلا ولها وجهان متقابلان لا يُفهم أحدهما إلا بمقابله، ولا تكتمل قراءتها إلا بقراءة الوجهين معاً.",
  },
];

export function HomeRules() {
  return (
    <section className="border-y border-line-soft bg-paper-deep">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <FadeIn>
          <header className="mx-auto max-w-2xl text-center">
            <span className="font-kufi text-xs font-medium tracking-[0.25em] text-accent-bright">
              القواعد
            </span>
            <h2 className="mt-4 font-amiri text-3xl font-bold leading-snug text-ink sm:text-4xl">
              أربع قواعد يجري عليها الكتاب كلّه
            </h2>
            <p className="mt-4 leading-relaxed text-ink-soft">
              قواعدُ منهجيةٌ استُقرئت من النصّ نفسه، عليها قام استخراجُ معاني
              الكتاب من أوّله إلى آخره.
            </p>
          </header>
        </FadeIn>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {rules.map((rule, i) => (
            <FadeIn key={rule.num} delay={i * 0.05} as="div">
              <article className="flex h-full flex-col rounded-2xl border border-line bg-card p-6">
                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-accent/30 font-kufi text-sm font-bold text-accent">
                  {rule.num}
                </span>
                <h3 className="mb-3 font-amiri text-lg font-bold leading-snug text-ink">
                  {rule.title}
                </h3>
                <p className="leading-relaxed text-ink-soft">{rule.body}</p>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
