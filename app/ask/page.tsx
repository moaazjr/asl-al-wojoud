import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/prose";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "اطرح سؤالك",
  description:
    "بابٌ للأسئلة الجادّة حول كتاب أصل الوجود — تصل مباشرةً إلى المؤلّف.",
  alternates: { canonical: `${siteConfig.url}/ask` },
};

const tips = [
  {
    title: "إن كان سؤالك عن موضعٍ بعينه",
    body: "اذكر رقم الفصل — يعينُ ذلك على الجواب الدقيق.",
  },
  {
    title: "إن كان سؤالك عمّا لم يعالجه الكتاب",
    body: "فقل ذلك صراحةً.",
  },
  {
    title: "راجع حدود هذا المشروع",
    body: "فما كان من باب الفتوى أو الحكم على الأشخاص لا يُجاب عنه هنا.",
  },
];

export default function AskPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8 lg:py-12">
      <Breadcrumbs items={[{ label: "اطرح سؤالك" }]} />

      <PageHeader
        eyebrow="اتّصل بنا"
        title="اطرح سؤالك"
        lead="هذا بابٌ للسؤال الجادّ. من وجد في الكتاب ما أشكل عليه، أو رأى فيه ما يستدعي مراجعةً بحجّةٍ من النصّ — فليكتب."
      />

      <div className="space-y-10">
        <section>
          <h2 className="mb-4 font-amiri text-2xl font-bold text-ink">
            قبل أن تكتب
          </h2>
          <ul className="space-y-3">
            {tips.map((tip) => (
              <li key={tip.title} className="rounded-xl border border-line bg-card p-5">
                <p className="font-kufi text-sm font-semibold text-ink">
                  {tip.title}
                </p>
                <p className="mt-1 leading-relaxed text-ink-soft">{tip.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <form className="space-y-5 rounded-xl border border-line bg-card p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block font-kufi text-sm font-medium text-ink-soft"
                >
                  الاسم
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 font-kufi text-sm text-ink placeholder:text-ink-faint focus:border-accent-bright focus:outline-none focus:ring-2 focus:ring-accent-soft"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block font-kufi text-sm font-medium text-ink-soft"
                >
                  البريد الإلكترونيّ
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 font-kufi text-sm text-ink placeholder:text-ink-faint focus:border-accent-bright focus:outline-none focus:ring-2 focus:ring-accent-soft"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="chapter"
                className="mb-1.5 block font-kufi text-sm font-medium text-ink-soft"
              >
                رقم الفصل (اختياريّ)
              </label>
              <input
                id="chapter"
                type="text"
                name="chapter"
                className="w-full rounded-lg border border-line bg-paper px-3 py-2.5 font-kufi text-sm text-ink placeholder:text-ink-faint focus:border-accent-bright focus:outline-none focus:ring-2 focus:ring-accent-soft"
              />
            </div>
            <div>
              <label
                htmlFor="question"
                className="mb-1.5 block font-kufi text-sm font-medium text-ink-soft"
              >
                السؤال
              </label>
              <textarea
                id="question"
                name="question"
                rows={6}
                className="w-full resize-y rounded-lg border border-line bg-paper px-3 py-2.5 font-kufi text-sm text-ink placeholder:text-ink-faint focus:border-accent-bright focus:outline-none focus:ring-2 focus:ring-accent-soft"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-accent px-6 py-2.5 font-kufi text-sm font-semibold text-paper transition-colors hover:bg-accent-bright"
            >
              أرسل
            </button>
          </form>
          <p className="mt-4 text-center font-kufi text-xs text-ink-faint">
            الأسئلة تُقرأ كلُّها، والجواب يصل حين يتيسّر. وما تكرّر منها يُضاف
            إلى صفحة{" "}
            <Link
              href="/faq"
              className="font-semibold text-accent transition-colors hover:text-accent-bright"
            >
              الأسئلة الشائعة
            </Link>{" "}
            لينتفع به غيرك.
          </p>
        </section>
      </div>
    </div>
  );
}
