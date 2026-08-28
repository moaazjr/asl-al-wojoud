import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader, Blockquote } from "@/components/layout/prose";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "فكرة المشروع وأسبابه",
  description:
    "لماذا كُتب «أصل الوجود»؟ المواقف الثلاثة من النصّ القرآنيّ، والسبب الذي دفع إلى خمسة عشر عاماً من الاستقراء الداخليّ.",
  alternates: { canonical: `${siteConfig.url}/about-project` },
};

const stances = [
  {
    num: "١",
    title: "أن يُقرأ القرآن بعيون الماضي لا بعين الحاضر",
    body: "أن يُحال السائل إلى ما دُوّن في القرون الأولى، فيصير فهم الأقدمين هو المرآة التي لا يُرى النصّ إلا من خلالها.",
    quote:
      "وفي هذا الموقف يصير المعنى استحضاراً للماضي، لا مراداً يُستخرَج بزمنه، ويُحجَب النصّ عن قارئه بطبقةٍ من الأفهام منتهية الصلاحية لا تحاكي واقعه.",
    follow: [
      {
        lead: "وليس في هذا غمطٌ لفضل السابقين:",
        text: "فلهم في حفظ النصّ وخدمة علومه ما لا يُنكَر؛ وإنّما الخلل في تقديس الفهم البشريّ حتى يصير أصلاً لا يُراجَع، لا منزلةً اجتهاديةً يُبنى عليها ويُستدرَك.",
      },
    ],
  },
  {
    num: "٢",
    title: "ردُّ فعلٍ على الأول: تحرّرٌ بلا قاعدة",
    body: "أن يدّعي صاحبه التحرّر من تلك الأفهام، فيرفع شعاراً ولا يطبّقه على نفسه، ويُسقط على النصّ مفهومه هو فيراه فيه.",
    quote:
      "ويظنّ أنّه يقرأ النصّ، إنّما يقرأ ذاته في النصّ. فهذا وإن تحرّر من سلطان الأقدمين، وقع في سلطانٍ أخفى وأشدّ: سلطان فهمه المسبق.",
    follow: [],
  },
  {
    num: "٣",
    title: "وعليه قام هذا الكتاب: التدبّر المنضبط بقواعده",
    body: "الموقف الذي قام عليه هذا العمل.",
    quote:
      "لا يُسقِط على النصّ رأياً، ولا يحمل إليه فهماً يسير به في قراءته؛ بل يَدَع النصَّ هو الذي يقوده، حيث تأخذه مقاصدُه، فيبني معه المفاهيم والمواضيع شيئاً فشيئاً، حتى يبلغ به النصُّ بنيتَه التي تأصّل عليها.",
    follow: [],
  },
];

export default function AboutProjectPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8 lg:py-12">
      <Breadcrumbs items={[{ label: "فكرة المشروع وأسبابه" }]} />

      <PageHeader
        eyebrow="فكرة هذا المشروع"
        title="السؤال الذي بدأ منه كلُّ شيء"
      />

      <div className="space-y-12">
        <section>
          <Blockquote>
            «قلّما يقرأ اثنان النصّ القرآنيّ فيخرجان منه بفهمٍ واحد، وما ذلك
            لغموضٍ في النصّ، بل لاختلاف المدخل الذي يُؤتى منه.»
          </Blockquote>
          <p className="leading-loose text-ink-soft">
            فإذا كان النصّ واحداً والاختلاف قائماً، فالعلّة في المدخل لا في
            النصّ. ومن هنا وُلد هذا العمل: بحثاً عن مدخلٍ منضبطٍ يقود إليه
            النصُّ ولا يقوده القارئ.
          </p>
        </section>

        <section>
          <h2 className="mb-2 font-amiri text-2xl font-bold text-ink">
            المواقف الثلاثة
          </h2>
          <p className="mb-6 leading-loose text-ink-soft">
            وقد تبيّن من طول استقراء النصّ أنّ القارئ لا يكاد يقف بين يدي القرآن
            إلا على أحد ثلاثة مواقف، اثنان منها يحولان بينه وبين مراد النصّ.
          </p>
          <ol className="space-y-6">
            {stances.map((stance) => (
              <li key={stance.num} className="rounded-xl border border-line bg-card p-6">
                <div className="mb-2 font-kufi text-xs font-semibold text-accent-bright">
                  الموقف {stance.num}
                </div>
                <h3 className="mb-2 font-kufi text-lg font-semibold text-ink">
                  {stance.title}
                </h3>
                <p className="leading-loose text-ink-soft">{stance.body}</p>
                <blockquote className="mt-4 border-e-[3px] border-accent-bright pe-4 font-amiri text-base italic leading-[1.9] text-accent">
                  «{stance.quote}»
                </blockquote>
                {stance.follow.map((f, i) => (
                  <p key={i} className="mt-3 leading-loose text-ink-soft">
                    <span className="font-semibold text-ink">{f.lead}</span>{" "}
                    {f.text}
                  </p>
                ))}
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="mb-4 font-amiri text-2xl font-bold text-ink">
            الآية التي صيغ عليها هذا العمل
          </h2>
          <p className="mb-4 leading-loose text-ink-soft">
            يفتتح القرآن الكتاب بقوله ﴿الم ذلك الكتاب لا ريب فيه﴾. وفي اسم
            الإشارة «ذلك» بابٌ من التدبّر يكشف طبيعة الكتاب وطريقة قراءته
            معاً، قبل أن يُقرأ منه حرف.
          </p>
          <p className="mb-4 leading-loose text-ink-soft">
            فالقرآن حين يشير إلى أجزاء الكتاب المتفرّقة يختار «تلك»: ﴿تلك آيات
            الله﴾، ﴿تلك الرسل﴾، ﴿تلك القرى﴾، ﴿تلك الأيام﴾، ﴿تلك حدود الله﴾.
            فإذا اجتمعت هذه الجماعات وانتظمت صارت «الكتاب» — اسماً مفرداً
            مذكّراً — فلم يعد يصلح له «تلك»، بل «ذلك».
          </p>
          <p className="mb-4 leading-loose text-ink-soft">
            وهذه الأجزاء ليست نصوصاً مجرّدة، بل معطياتٌ منبثّةٌ في الوجود
            والتاريخ: آياتٌ كونيةٌ في الآفاق، ورسلٌ مضوا، وقرًى خلت، وأيامٌ
            تُداول، وحدودٌ تجري في التشريع.
          </p>
          <Blockquote>
            «فلو قيل «هذا الكتاب» لاقتصر النظر على ما بين الدفّتين، مغلقاً على
            مضامينه، مقروءاً بمعزلٍ عن الواقع. أمّا «ذلك» فتفتح النظر على ما
            وراء النصّ... فإن اسم الإشارة نفسه تعليمةٌ وإشارة منهجيةٌ في أوّل
            الكتاب: اقرأه مربوطاً بالكون والسنن والتاريخ، لا متناً منقطعاً عن
            الواقع.»
          </Blockquote>
          <p className="leading-loose text-ink-soft">
            وعلى هذا المنوال بُني هذا العمل: كلُّ مفهومٍ فيه مقروءٌ مرّتين — في
            النصّ، وفي الوجود الذي يحاكيه النصّ.
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-amiri text-2xl font-bold text-ink">
            مستويا الإيمان
          </h2>
          <p className="mb-4 leading-loose text-ink-soft">
            وممّا يُضيء الكتابَ كلَّه تمييزٌ تأسيسيّ: أنّ الإيمان في القرآن
            مستويان لا مستوىً واحد.
          </p>
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-card p-6">
              <h3 className="mb-2 font-kufi text-lg font-semibold text-ink">
                الأول
              </h3>
              <p className="leading-loose text-ink-soft">
                إيمانٌ منشؤه الآبائيّة، يعتمد فيه المرء على غيره فيؤمن إيماناً
                نظرياً متلقًّى لا مكتسَباً؛ من قام به أغلق باب النظر واكتفى —
                فإن عمل مع ذلك صالحاً فله أجرُه عند ربّه.
              </p>
            </div>
            <div className="rounded-xl border border-line bg-card p-6">
              <h3 className="mb-2 font-kufi text-lg font-semibold text-ink">
                الثاني
              </h3>
              <p className="leading-loose text-ink-soft">
                إيمانٌ مكتسَبٌ بالبحث والاجتهاد والتقصّي، يطابق بين النصّ
                والوجود، فيبني به الإنسانُ منظومةً جامعةً تُقيم أفكاره — ﴿وَالَّذِينَ
                إِذَا ذُكِّرُوا بِآيَاتِ رَبِّهِمْ لَمْ يَخِرُّوا عَلَيْهَا صُمًّا
                وَعُمْيَانًا﴾.
              </p>
            </div>
          </div>
          <p className="mt-4 leading-loose text-ink-soft">
            والكتاب في جملته منصرفٌ إلى بيان هذا البناء.
          </p>
        </section>

        <section>
          <h2 className="mb-4 font-amiri text-2xl font-bold text-ink">
            الغاية
          </h2>
          <Blockquote>
            «فهذا الكتاب دعوةٌ إلى قراءة القرآن بالقرآن، وإلى الإمساك بالنصّ من
            حيث يُمسِك بنفسه. وغايتُه أن يُبيّن لا أن يُلزِم، وأن يفتح بابَ
            النظر لا أن يُغلِقه؛ فمن وجد فيه ما يُقنعه فبالحجّة، ومن خالفه
            فبالنصّ.»
          </Blockquote>
        </section>
      </div>
    </div>
  );
}
