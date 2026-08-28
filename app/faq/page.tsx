import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "الأسئلة الشائعة",
  description: `أسئلة شائعة حول مشروع ${siteConfig.workTitle}.`,
  alternates: { canonical: `${siteConfig.url}/faq` },
};

const faqs = [
  {
    q: "ما هو مشروع \"أصل الوجود\"؟",
    a: "مشروع معرفي يقدّم قراءة منهجية للقرآن من داخله، ويسعى إلى بناء رؤية متكاملة تنطلق من النص القرآني نفسه، ومن ترابط مفاهيمه وموضوعاته.",
  },
  {
    q: "هل المشروع مفتوح للنقاش؟",
    a: "نعم، المشروع مفتوح للتدبّر والحوار والنقد العلميّ. يهدف إلى إتاحة المادة كاملة بصورة منظمة وسهلة القراءة.",
  },
  {
    q: "كيف يمكنني المساهمة في المشروع؟",
    a: "يمكنك المشاركة عبر قسم النقاشات المتاحة في الموقع، أو التواصل معنا مباشرة.",
  },
  {
    q: "هل المحتوى مجاني؟",
    a: "نعم، جميع محتويات المشروع متاحة مجاناً لجميع القرّاء.",
  },
  {
    q: "كيف أنحاءّ الكتاب رقمياً؟",
    a: "يمكنك قراءة الكتاب من خلال الموقع الإلكتروني، مع إمكانية التنقّل بين الأبواب والفصول بسهولة عبر الفهرس العام.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8 lg:py-12">
      <Breadcrumbs items={[{ label: "الأسئلة الشائعة" }]} />

      <header className="mb-10 border-b border-line pb-8 text-center">
        <span className="font-kufi text-xs font-medium uppercase tracking-[0.2em] text-accent-bright">
          أسئلة شائعة
        </span>
        <h1 className="mt-3 font-amiri text-4xl font-bold text-ink sm:text-5xl">
          الأسئلة الشائعة
        </h1>
      </header>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group rounded-xl border border-line bg-card"
          >
            <summary className="cursor-pointer list-none px-6 py-4 font-kufi text-sm font-semibold text-ink transition-colors hover:text-accent">
              {faq.q}
            </summary>
            <div className="border-t border-line px-6 py-4 text-sm leading-relaxed text-ink-soft">
              {faq.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
