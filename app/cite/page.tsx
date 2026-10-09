import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/prose";
import { FullBookDownloadButton } from "@/components/analytics/full-book-download-button";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "التحميل والاستشهاد",
  description:
    "حمّل «أصل الوجود» مجّاناً بترخيص المشاع الإبداعي، وصيغ الاستشهاد الجاهزة، والمعرّف الرقميّ الدائم DOI.",
  alternates: { canonical: `${siteConfig.url}/cite` },
};

const locations = [
  { label: "Zenodo (المستودع الأصل)", href: "https://zenodo.org/records/21855464" },
  { label: "Internet Archive", href: "https://archive.org/details/asl-alwujud-alsabbagh" },
  { label: "Academia.edu", href: siteConfig.academia },
  { label: "ORCID (هويّة المؤلّف)", href: siteConfig.orcid },
  { label: "Google Scholar", href: siteConfig.scholar },
];

export default function CitePage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8 lg:py-12">
      <Breadcrumbs items={[{ label: "التحميل والاستشهاد" }]} />

      <PageHeader
        eyebrow="التحميل والاستشهاد"
        title="التحميل والاستشهاد"
        lead="الكتاب متاحٌ مجّاناً، وموثّقٌ بمعرّفٍ رقميٍّ دائمٍ لا يتغيّر."
      />

      <div className="space-y-12">
        <section>
          <h2 className="mb-4 font-amiri text-2xl font-bold text-ink">
            المعرّف الدائم
          </h2>
          <div className="rounded-xl border border-line bg-card p-6 text-center">
            <div className="font-kufi text-xs text-ink-faint">DOI</div>
            <div className="mt-1 font-kufi text-lg font-bold text-accent" dir="ltr">
              10.5281/zenodo.21855463
            </div>
            <a
              href="https://doi.org/10.5281/zenodo.21855463"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block font-kufi text-xs text-accent transition-colors hover:text-accent-bright"
              dir="ltr"
            >
              https://doi.org/10.5281/zenodo.21855463
            </a>
          </div>
          <p className="mt-4 leading-loose text-ink-soft">
            هذا المعرّف يشير دائماً إلى أحدث نسخةٍ من الكتاب. اعتمده في كل
            استشهاد.
          </p>
          <FullBookDownloadButton className="mt-4" />
        </section>

        <section>
          <h2 className="mb-4 font-amiri text-2xl font-bold text-ink">
            المواضع
          </h2>
          <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
            {locations.map((loc) => (
              <li key={loc.label} className="bg-card">
                <a
                  href={loc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm text-ink-soft transition-colors hover:bg-accent-bright/10 hover:text-ink"
                >
                  <span className="font-kufi font-medium">{loc.label}</span>
                  <ExternalLink
                    className="h-4 w-4 shrink-0 text-accent-bright"
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 font-amiri text-2xl font-bold text-ink">
            صيغ الاستشهاد
          </h2>
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-card p-5">
              <div className="mb-2 font-kufi text-xs font-semibold text-accent-bright">
                بالعربية
              </div>
              <p className="leading-loose text-ink-soft" dir="rtl">
                منذر الصبّاغ، أصل الوجود: قراءةٌ منهجيةٌ للقرآن من داخله، من
                المصدر إلى المصير، الطبعة الأولى، دمشق {siteConfig.attributionYear}.{" "}
                <span dir="ltr">https://doi.org/10.5281/zenodo.21855463</span>
              </p>
            </div>

            <div className="rounded-xl border border-line bg-card p-5">
              <div className="mb-2 font-kufi text-xs font-semibold text-accent-bright">
                APA
              </div>
              <p className="leading-relaxed text-ink-soft" dir="ltr">
                Alsabbagh, M. (2026). <em>Aṣl al-wujūd: A methodical reading of
                the Qur&apos;an from within, from the Origin to the
                Destination</em>. Damascus.{" "}
                https://doi.org/10.5281/zenodo.21855463
              </p>
            </div>

            <div className="rounded-xl border border-line bg-card p-5">
              <div className="mb-2 font-kufi text-xs font-semibold text-accent-bright">
                BibTeX
              </div>
              <pre className="overflow-x-auto font-kufi text-xs leading-relaxed text-ink-soft" dir="ltr">
{`@book{alsabbagh2026asl,
  author    = {Alsabbagh, Monzer},
  title     = {أصل الوجود: قراءةٌ منهجيةٌ للقرآن من داخله، من المصدر إلى المصير},
  year      = {2026},
  address   = {Damascus},
  pages     = {656},
  doi       = {10.5281/zenodo.21855463},
  url       = {https://doi.org/10.5281/zenodo.21855463}
}`}
              </pre>
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-amiri text-2xl font-bold text-ink">
            الترخيص
          </h2>
          <div className="rounded-xl border border-line bg-card p-6">
            <p className="font-kufi text-sm font-semibold text-ink">
              المشاع الإبداعي — النسب، غير تجاريّ، بلا اشتقاق (CC BY-NC-ND 4.0)
            </p>
            <p className="mt-3 leading-loose text-ink-soft">
              يجوز نقله ونشره وتوزيعه مجّاناً بشرط الإسناد الكامل إلى المؤلّف
              وذكر المعرّف، ولا يجوز بيعه ولا التعديل عليه.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
