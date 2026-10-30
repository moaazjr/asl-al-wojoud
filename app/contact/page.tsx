import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MessageSquareText } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/prose";
import { ContactForm } from "@/features/contact/contact-form";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description:
    "البريد الإلكتروني الرسمي لموقع أصل الوجود ونموذج التواصل المباشر مع المشرف على المشروع.",
  alternates: { canonical: `${siteConfig.url}/contact` },
};

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8 lg:py-12">
      <Breadcrumbs items={[{ label: "تواصل معنا" }]} />

      <PageHeader
        eyebrow="التواصل"
        title="تواصل معنا"
        lead="للملاحظات العلمية، أو الاستفسارات حول المشروع، أو طلبات النشر والاقتباس — يمكنك مراسلتنا مباشرةً أو استخدام النموذج أدناه."
      />

      <div className="space-y-8">
        <section
          aria-label="البريد الإلكتروني الرسمي"
          className="rounded-2xl border border-accent/25 bg-accent-soft/40 p-5 sm:p-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-paper text-accent">
                <Mail className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h2 className="font-kufi text-sm font-semibold text-ink">
                  البريد الإلكتروني الرسمي
                </h2>
                <p className="mt-1 font-kufi text-xs leading-relaxed text-ink-soft">
                  نرحّب بالمراسلات الجادّة، ونحرص على الردّ في أقرب وقت ممكن.
                </p>
              </div>
            </div>
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              dir="ltr"
              className="inline-flex items-center justify-center rounded-lg border border-accent/30 bg-paper px-4 py-2 font-kufi text-sm font-semibold text-accent transition-colors hover:border-accent/60 hover:text-accent-bright"
            >
              {siteConfig.contactEmail}
            </a>
          </div>
        </section>

        <section aria-labelledby="contact-form-title">
          <div className="mb-4 flex items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-accent" aria-hidden />
            <h2
              id="contact-form-title"
              className="font-amiri text-2xl font-bold text-ink"
            >
              أرسل رسالة
            </h2>
          </div>
          <ContactForm />
          <p className="mt-4 text-center font-kufi text-xs leading-relaxed text-ink-faint">
            تُحفظ الرسالة لدى إدارة الموقع وتُرسل إلى البريد الإداري المحدد. وإن
            كان سؤالك عن الكتاب تحديداً فاستخدم{" "}
            <Link
              href="/ask"
              className="font-semibold text-accent transition-colors hover:text-accent-bright"
            >
              صفحة الأسئلة
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
