import Link from "next/link";
import { Download, ExternalLink, Quote } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";
import { PdfDownloadAnchor } from "@/components/analytics/pdf-download-anchor";
import { siteConfig } from "@/data/site";

const DOI = "10.5281/zenodo.21855463";

export function HomeCitation() {
  return (
    <section className="border-t border-line-soft bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <FadeIn>
          <header className="mx-auto max-w-2xl text-center">
            <span className="font-kufi text-xs font-medium tracking-[0.25em] text-accent-bright">
              المراجع
            </span>
            <h2 className="mt-4 font-amiri text-3xl font-bold leading-snug text-ink sm:text-4xl">
              التحميل والاستشهاد
            </h2>
            <p className="mt-4 leading-relaxed text-ink-soft">
              الكتاب متاحٌ مجّاناً، وموثّقٌ بمعرّفٍ رقميٍّ دائمٍ لا يتغيّر.
            </p>
          </header>
        </FadeIn>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          <FadeIn>
            <article className="flex h-full flex-col rounded-2xl border border-line bg-card p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-paper">
                  <Quote className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="font-amiri text-xl font-bold text-ink">
                  صيغة الاستشهاد
                </h3>
              </div>
              <p className="leading-relaxed text-ink-soft">
                منذر الصبّاغ، أصل الوجود: قراءةٌ منهجيةٌ للقرآن من داخله، من
                المصدر إلى المصير، الطبعة الأولى، دمشق {siteConfig.attributionYear}.
              </p>
              <Link
                href="/cite"
                className="mt-auto inline-flex items-center gap-1.5 pt-5 font-kufi text-sm font-semibold text-accent transition-colors hover:text-accent-bright"
              >
                كلّ صيغ الاستشهاد (عربي، APA، BibTeX)
                <span aria-hidden>←</span>
              </Link>
            </article>
          </FadeIn>

          <FadeIn delay={0.05}>
            <article className="flex h-full flex-col rounded-2xl border border-line bg-card p-8">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-paper">
                  <ExternalLink className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="font-amiri text-xl font-bold text-ink">
                  المعرّف الرقمي (DOI)
                </h3>
              </div>
              <div className="font-kufi text-lg font-bold text-accent" dir="ltr">
                {DOI}
              </div>
              <a
                href={`https://doi.org/${DOI}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block font-kufi text-xs text-accent transition-colors hover:text-accent-bright"
                dir="ltr"
              >
                https://doi.org/{DOI}
              </a>
              <PdfDownloadAnchor
                href="https://zenodo.org/records/21855464"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-kufi text-sm font-semibold text-paper transition-colors hover:bg-accent-bright"
              >
                <Download className="h-4 w-4" aria-hidden />
                تحميل PDF
              </PdfDownloadAnchor>
            </article>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
