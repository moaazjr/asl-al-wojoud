import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader, Blockquote } from "@/components/layout/prose";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "حدود هذا المشروع",
  description:
    "ما يقوله هذا المشروع وما لا يقوله: لا يفتي، ولا يحكم على أحد، ولا يدّعي عصمة. اجتهادٌ يُعرَض للنظر ويُناقَش بالنصّ.",
  alternates: { canonical: `${siteConfig.url}/limits` },
};

const points = [
  {
    num: "١",
    title: "هذا المشروع لا يُفتي",
    body: "ليس في الكتاب فتوى، ولا يُطلب من أحدٍ العمل به. هو قراءةٌ للنصّ تُعرَض للنظر. ومن أراد حكماً شرعياً في نازلةٍ فليطلبه من أهله.",
    quote: null,
  },
  {
    num: "٢",
    title: "ولا يحكم على أحد",
    body: "لا على شخصٍ، ولا على مذهب، ولا على طائفة. وما ورد فيه من مخالفةٍ للمألوف فليس مجابهةً لأحد.",
    quote:
      "ومن لزم هذا المنهج بصدقٍ بلغ به أحياناً ما يخالف ما استقرّ عند الناس قروناً، لا رغبةً في المخالفة ولا مجابهةً لأحد، بل لأنّ الميزان واحدٌ لا يحابي، فحيثما قاد النصُّ تَبِعه الباحث، وإن خالف المألوف.",
  },
  {
    num: "٣",
    title: "ولا يستهين بمن سبق",
    body: null,
    quote:
      "ولا يعني هذا استهانةً بما بذله السابقون من جهدٍ في خدمة النصّ، فكلٌّ عمل في حدود أدواته وزمنه، وإنّما المقصود أنّ الميزان اليوم هو النصّ ذاته، لا أقوال من سبقوه.",
  },
  {
    num: "٤",
    title: "ولا يدّعي عصمة",
    body: null,
    quote:
      "وليس في هذا الكتاب دعوى عصمةٍ ولا قطعٍ يُلزِم القارئ، بل هو ترجيحٌ يستمدّه صاحبه من استقراء النصّ، يعرضه عرضاً ويقول فيه «يترجّح» و«يتبيّن»، لا «هذا الحقّ الذي لا سواه». فما وافق منه الصوابَ فمن الله، وما جانبه فمن صاحبه.",
  },
  {
    num: "٥",
    title: "والقارئ شريكٌ لا متلقٍّ",
    body: null,
    quote:
      "والقارئ شريكٌ في النظر لا متلقٍّ يُسلّم؛ يَزِن ما فيه بميزان النصّ، فما رآه راجحاً أخذ به، وما رآه مرجوحاً ردّه بحجّةٍ من جنس حجّته، لا بمجرّد أنّه خالف ما اعتاد.",
  },
];

export default function LimitsPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8 lg:py-12">
      <Breadcrumbs items={[{ label: "حدود هذا المشروع" }]} />

      <PageHeader eyebrow="حدود" title="حدود هذا المشروع" />

      <div className="space-y-12">
        <p className="text-center font-kufi text-sm text-ink-faint">
          قبل أن تسأل أو تعترض، هذه حدودُ ما بين يديك.
        </p>

        <section>
          <ol className="space-y-6">
            {points.map((p) => (
              <li
                key={p.num}
                className="rounded-xl border border-line bg-card p-6"
              >
                <div className="mb-2 font-kufi text-xs font-semibold text-accent-bright">
                  {p.num}
                </div>
                <h2 className="mb-3 font-kufi text-lg font-semibold text-ink">
                  {p.title}
                </h2>
                {p.body && <p className="leading-loose text-ink-soft">{p.body}</p>}
                {p.quote && (
                  <blockquote className="border-e-[3px] border-accent-bright pe-4 font-amiri text-base italic leading-[1.9] text-accent">
                    {p.quote}
                  </blockquote>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="mb-4 font-amiri text-2xl font-bold text-ink">
            وكلمةٌ صريحةٌ من المؤلّف
          </h2>
          <Blockquote>
            ومؤلّف هذا الكتاب يعلم مُقدَّماً أنّ عمله هذا مردودٌ عند جهاتٍ لا
            تحبّذ النظر فيما استقرّ، ولا ترضى أن يُعاد فتح ما أُغلق، فتعدّ كلّ
            مراجعةٍ خروجاً وكلّ سؤالٍ جرأة. وهو لا يكتب لهؤلاء، ولا يطلب رضاهم،
            ولا يجادلهم في موقفهم، فلكلٍّ وجهةٌ هو مولّيها.
          </Blockquote>
          <Blockquote>
            وإن كنتَ ممّن آثر السكون إلى ما ورِث، فلا يلزمك منه شيء، ولصاحبه أن
            يعتذر إليك أنّه لم يكتبه لك، وأن يدعو لك ولنفسه بالهدى إلى أقوم
            سبيل.
          </Blockquote>
          <p className="mt-6 text-center font-kufi text-sm text-ink-soft">
            فمن أراد النقاش فبابُه مفتوح — والميزان هو النصّ.
          </p>
          <div className="mt-4 text-center">
            <Link
              href="/ask"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-kufi text-sm font-semibold text-paper transition-colors hover:bg-accent-bright"
            >
              اطرح سؤالك
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
