import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader, Blockquote } from "@/components/layout/prose";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "كيف تقرأ هذا الكتاب",
  description:
    "هذا الكتاب مبنيٌّ بعضُه على بعض ويُقرأ جملةً واحدة. أربع إرشاداتٍ في قراءته، ومفتاحُه الأكبر: الزوجيّة.",
  alternates: { canonical: `${siteConfig.url}/how-to-read` },
};

const guides = [
  {
    num: "١",
    title: "ابدأ بالباب الأول — فهو الأساس لا التمهيد",
    quote:
      "فمن أتقن تلك المفاتيح — التمييزَ بين أصل الخلق وغايته، وبين الذات والمقام، وبين الأمر والخلق، وبين المسطور والمنشور، وبين الثابت الكلّيّ والظرفيّ، وبين مقامات الأسماء — دخل ما بعدها بعين قارئٍ مستقلٍّ يزن المفهوم بميزانه؛ ومن تجاوزها قرأ سائر الكتاب بزمن أمّةٍ خلت لا بعين حاضره، فاختلّ عليه البناء.",
  },
  {
    num: "٢",
    title: "احمل معك المفتاح الأكبر: الزوجيّة",
    quote:
      "فليقرأ القارئ هذا الكتاب وهو يحمل هذا الميزان، يتتبّع في كلّ فصلٍ وجهين متقابلين ينبثق من اجتماعهما معنىً لا يُرى بأحدهما وحده.",
    note: "وهذا المفتاح مؤسَّسٌ في مبحث الرحمن — ٢٫١٫٢.",
  },
  {
    num: "٣",
    title: "لا تقضِ على فصلٍ قبل مواضعه",
    body: "إن وجدتَ في موضعٍ سؤالاً معلّقاً، فاطلب تمامه في موضعه قبل أن تحكم. والكتاب يفسّر بعضه بعضاً كما يفسّر النصُّ الذي قام على منهجه بعضُه بعضاً.",
  },
  {
    num: "٤",
    title: "انظر ولا تُسلّم",
    quote:
      "وليعلم أنّ هذا الاستخراج اجتهادٌ في فهم كلام الله، يُطلب فيه الصواب ولا يُدَّعى فيه العصمة... فالثقة المطلوبة ثقةٌ في المصدر الذي يُستخرَج منه، وفي المنهج الذي يُستخرَج به، لا في المُستخرِج الذي يبقى بشراً يصيب ويخطئ.",
  },
];

export default function HowToReadPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8 lg:py-12">
      <Breadcrumbs items={[{ label: "كيف تقرأ هذا الكتاب" }]} />

      <PageHeader
        eyebrow="تنويهٌ قبل الدخول"
        title="كيف تقرأ هذا الكتاب"
      />

      <div className="space-y-12">
        <section>
          <Blockquote>
            هذا الكتاب مبنيٌّ بعضُه على بعض، لا تنفصل فيه مسألةٌ عن مواضعها،
            فحقُّه في القراءة أن يُتلقّى جملةً واحدة، لا أن يُقتطَع منه فصلٌ
            فيُحاكَم وحده. فقد يُثار في موضعٍ سؤالٌ يتبيّن جوابُه في موضعٍ
            بعده، وقد يُطلَق في بابٍ أصلٌ يتفصّل حكمُه في بابٍ يليه، إذ ليست
            الأبواب أجزاءً مستقلّةً يُكتفى بكلٍّ منها، بل حلقاتٌ في قوسٍ واحد،
            لا يستقيم فهمُ أوّلها إلا بآخرها.
          </Blockquote>
          <Blockquote>
            فمن قرأ فصلاً منقطعاً عمّا قبله وما بعده، ثمّ وجد فيه نقصاً أو
            سؤالاً معلّقاً، فليطلب تمامَه في مواضعه قبل أن يقضي... وهذه دعوةٌ
            إلى أناةٍ في القراءة لا إلى تسليمٍ بالنتائج؛ فإنّ النظر المتأنّي في
            البناء كلِّه أعدلُ من الحكم على لبنةٍ نُزِعَت من موضعها.
          </Blockquote>
        </section>

        <section>
          <h2 className="mb-6 font-amiri text-2xl font-bold text-ink">
            أربع إرشادات
          </h2>
          <ol className="space-y-6">
            {guides.map((g) => (
              <li
                key={g.num}
                className="rounded-xl border border-line bg-card p-6"
              >
                <div className="mb-2 font-kufi text-xs font-semibold text-accent-bright">
                  {g.num}
                </div>
                <h3 className="mb-3 font-kufi text-lg font-semibold text-ink">
                  {g.title}
                </h3>
                {g.body && <p className="leading-loose text-ink-soft">{g.body}</p>}
                {g.quote && (
                  <blockquote className="border-e-[3px] border-accent-bright pe-4 font-amiri text-base italic leading-[1.9] text-accent">
                    {g.quote}
                  </blockquote>
                )}
                {g.note && (
                  <p className="mt-3 font-kufi text-xs text-ink-faint">
                    {g.note}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="mb-4 font-amiri text-2xl font-bold text-ink">
            لمن كُتب هذا الكتاب
          </h2>
          <Blockquote>
            هذا الكتاب لمن يطلب، لا لمن وصل فاستراح. لمن يرى في كتاب الله
            صراطاً مستقيماً يُسلَك، لا متاعاً موروثاً يُحفَظ كما وُرِث ولا
            يُسأل عنه. لمن يقرأ القرآن بعين النصّ نفسه، يستقري ويتفكّر ويزن
            المفهوم بميزانه، لا بعين ما ألِف الناس وتوارثوه فأمسى عندهم
            كالمسلَّمات التي لا تُراجَع.
          </Blockquote>
        </section>
      </div>
    </div>
  );
}
