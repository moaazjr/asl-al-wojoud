import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader, Blockquote } from "@/components/layout/prose";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "المنهج — قراءة القرآن من داخله",
  description:
    "أربع قواعد وخمسة عشر مفتاحاً في قراءة القرآن من داخله: الاستقراء الداخليّ، وعدم الترادف، ودقّة الحرف، والزوجيّة — منهج كتاب أصل الوجود لمنذر الصبّاغ.",
  alternates: { canonical: `${siteConfig.url}/method` },
};

const rules = [
  {
    num: "١",
    title: "الاستقراء الداخليّ",
    body: "القرآن يفسّر بعضه بعضاً. لا يُقرَّر معنىً قبل استقراء مواضعه كافّةً في النصّ نفسه، ولا يُستعار من خارجه.",
  },
  {
    num: "٢",
    title: "لا ترادف",
    body: "لا يُكرّر القرآن ألفاظه عبثاً، ولا يستعمل كلمةً مكان أخرى بلا قصد. فكلُّ لفظةٍ تحمل ظلاًّ دلالياً خاصاً يميّزها عن غيرها وإن قَرُبت منها. وما يبدو ترادفاً هو في حقيقته تنوّعٌ مقصودٌ في الوظيفة.",
  },
  {
    num: "٣",
    title: "لا حرف زائد",
    body: "القرآن كتابٌ محكَم، كلُّ حرفٍ فيه مقصودٌ بدقّة. فكلُّ زيادةٍ أو حذفٍ أو اختلافِ حرفٍ بين كلمتين يغيّر المعنى ويضيف بُعداً خاصاً. وما من حرفٍ في النصّ إلا وله وظيفةٌ في المعنى.",
  },
  {
    num: "٤",
    title: "الزوجيّة — المفتاح الأكبر",
    body: "﴿وَمِن كُلِّ شَيْءٍ خَلَقْنَا زَوْجَيْنِ لَعَلَّكُمْ تَذَكَّرُونَ﴾",
  },
];

const keyTables = [
  {
    title: "في طبيعة النصّ",
    rows: [
      ["٧٫٢", "الإحكام والتفصيل", "المحكماتُ أصولٌ كليّة، والتفصيلُ بيانٌ يشرحها — ولا يكتمل الفهم إلا بجمعهما"],
      ["٧٫٨", "أقسام الكتاب الجامع", "بنيةٌ رباعيّةٌ لا ينبغي للمتدبّر أن يخلط بينها"],
      ["٧٫٩", "القرآن جملةٌ واحدة", "﴿الَّذِينَ جَعَلُوا الْقُرْآنَ عِضِينَ﴾ — بناءٌ متآزرٌ لا مقاطعُ متناثرة"],
      ["٧٫١٠", "اللسان العربيّ المبين", "لا شعرٌ يُزيّن بالوزن والحشو، ولا كهانةٌ تُوهم بالغيب"],
      ["٧٫١٤", "مواقع النجوم والفواصل", "الفاصلة وقفٌ توقيفيّ، والرقمُ تابعٌ للتقطيع لا حاكمٌ عليه"],
    ],
  },
  {
    title: "في ضبط اللفظ",
    rows: [
      ["٧٫٣", "عدم الترادف", "لكلّ لفظٍ ظلُّه الدلاليّ الذي يميّزه"],
      ["٧٫٤", "لا حرف زائد", "كلُّ حرفٍ مقصودٌ بدقّة"],
      ["٧٫٧", "المعنى العامّ للكلمة", "لكلّ كلمةٍ معنىً عامٌّ ثابت، والسياق يحدّد خاصَّها دون أن يُخرجها عن عمومها — و«الزوج» أنموذجاً"],
    ],
  },
  {
    title: "في موقف القارئ",
    rows: [
      ["٧٫١", "التدبّر", "من «الدُّبُر» — النظرُ فيما وراء ظاهر اللفظ. فالغاية ليست التلاوة بل تحويل القراءة من حركة لسانٍ إلى فعل وعي"],
      ["٧٫٥", "الاكتفاء بالقرآن", "من أقبل على النصّ محمَّلاً بموروثاته لم يفهم مراد الله، بل قرأ ما في ذهنه هو"],
      ["٧٫٦", "الترتيل والمثاني", "جمعُ المتشابه المتوزّع في السور في نسقٍ واحد"],
      ["٧٫١١", "كفاية النصّ", "لا فراغاتِ فيه، ولا وصاياتِ عليه، ولا ملاحقَ خارجه"],
    ],
  },
  {
    title: "في حدود الفهم",
    rows: [
      ["٧٫١٢", "لكلِّ نبإٍ مستقرّ", "التشريع بيانُه منجَزٌ حاضر، والآياتُ الكونيّة يتكشّف معناها عند مستقرّها"],
      ["٧٫١٣", "اعتماد نسخة حفص", "التنزيل التامّ المطهّر نصّاً ورسماً ونطقاً وضبطاً"],
      ["٧٫١٥", "وحدة الكتابين", "القرآن نصٌّ ناطق، والوجود لوحٌ صامت — وكلاهما كتابٌ من عند الله يصدّق أحدهما الآخر"],
    ],
  },
];

export default function MethodPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8 lg:py-12">
      <Breadcrumbs items={[{ label: "المنهج" }]} />

      <PageHeader
        eyebrow="المنهج"
        title="قراءةُ القرآن من داخله"
        lead="أربع قواعد وخمسة عشر مفتاحاً في قراءة القرآن من داخله — منهج كتاب «أصل الوجود»."
      />

      <div className="space-y-12">
        <section>
          <p className="leading-loose text-ink-soft">
            كلُّ معنىً في هذا الكتاب مُستخرَجٌ باستقراء مواضعه كافّةً في النصّ
            ذاته. لا يُبنى على حديثٍ ولا أثرٍ ولا قولِ سالف، ولا يُقرَّر معنىً
            قبل استقصاء نظائره.
          </p>
          <Blockquote>
            «فكلّ قاعدةٍ تُقرَّر في هذه الصفحات إنّما تُستخرَج من تتبّع مواضعها
            في القرآن واستقصاء نظائرها، لا تُحمَل على النصّ من تصوّرٍ سابق.
            والقارئ لا يُطلَب منه التسليم، بل النظر؛ فما من دعوى إلا ومعها
            شاهدُها من النصّ.»
          </Blockquote>
        </section>

        <section>
          <h2 className="mb-4 font-amiri text-2xl font-bold text-ink">
            القواعد الأربع
          </h2>
          <ol className="space-y-4">
            {rules.map((rule) => (
              <li
                key={rule.num}
                className="rounded-xl border border-line bg-card p-6"
              >
                <div className="mb-2 font-kufi text-xs font-semibold text-accent-bright">
                  القاعدة {rule.num}
                </div>
                <h3 className="mb-2 font-kufi text-lg font-semibold text-ink">
                  {rule.title}
                </h3>
                <p className="leading-loose text-ink-soft">{rule.body}</p>
                {rule.num === "٢" && (
                  <blockquote className="mt-4 border-e-[3px] border-accent-bright pe-4 font-amiri text-base italic leading-[1.9] text-accent">
                    «فإذا قرأنا النصّ بالترادف جعلناه فضفاضاً يتّسع لرؤية قارئه؛
                    وإذا قرأناه بحروفه قادنا إلى مقاصده.»
                  </blockquote>
                )}
                {rule.num === "٤" && (
                  <blockquote className="mt-4 border-e-[3px] border-accent-bright pe-4 font-amiri text-base italic leading-[1.9] text-accent">
                    «فما من حقيقةٍ فيه إلا ولها وجهان متقابلان لا يُفهم أحدهما
                    إلا بمقابله، ولا تكتمل قراءتها إلا بقراءة الوجهين معاً في
                    المقام الجامع لهما. وعليها بُني اسمه — فأصل الوجود زوجٌ،
                    ومفتاح فهمه قراءة الزوج.»
                  </blockquote>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="mb-2 font-amiri text-2xl font-bold text-ink">
            خمسة عشر مفتاحاً
          </h2>
          <p className="mb-6 leading-loose text-ink-soft">
            وهذه المفاتيح مبسوطةٌ في الباب السابع من الكتاب. وهي — على قول
            المؤلّف — أبقى ممّا فُرِّع عليها:
          </p>
          <Blockquote>
            «وأصدقُ ما يُورَّثه هذا الكتابُ ليس نتائجَه بل أداتَه؛ فالمفاتيحُ
            التي بها استُنطِقَ النصُّ أبقى من كلّ مسألةٍ فُرِّعت عليها.»
          </Blockquote>

          <div className="space-y-8">
            {keyTables.map((group) => (
              <div key={group.title}>
                <h3 className="mb-3 font-kufi text-base font-semibold text-accent">
                  {group.title}
                </h3>
                <div className="overflow-x-auto rounded-xl border border-line">
                  <table className="w-full text-right">
                    <tbody>
                      {group.rows.map((row) => (
                        <tr
                          key={row[0]}
                          className="border-t border-line-soft first:border-t-0"
                        >
                          <td className="whitespace-nowrap px-4 py-3 font-kufi text-xs text-accent-bright">
                            {row[0]}
                          </td>
                          <td className="whitespace-nowrap px-4 py-3 font-kufi text-sm font-semibold text-ink">
                            {row[1]}
                          </td>
                          <td className="px-4 py-3 text-sm leading-relaxed text-ink-soft">
                            {row[2]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-amiri text-2xl font-bold text-ink">
            وحدُّ هذا المنهج
          </h2>
          <Blockquote>
            «وهذا المنهج يقتضي تواضعاً في الصياغة، فلكلّ قارئٍ مقدرته وحدوده:
            فحيث يقطع النصّ نقطع، وحيث يترجّح المعنى نقول يترجّح، فلا يُحمَّل
            النصُّ ما لا يحتمل، ولا يُلبَس الاجتهادُ ثوبَ اليقين.»
          </Blockquote>
          <Link
            href="/toc"
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-kufi text-sm font-semibold text-paper transition-colors hover:bg-accent-bright"
          >
            اقرأ الباب السابع كاملاً
            <ArrowLeft className="h-4 w-4" aria-hidden />
          </Link>
        </section>
      </div>
    </div>
  );
}
