import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PageHeader } from "@/components/layout/prose";
import { siteConfig } from "@/data/site";

const authorJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: siteConfig.author,
  alternateName: siteConfig.authorEn,
  jobTitle: "باحث مستقلّ في الدراسات القرآنية",
  url: `${siteConfig.url}/author`,
  sameAs: [
    siteConfig.orcid,
    siteConfig.scholar,
    siteConfig.academia,
    "https://archive.org/details/asl-alwujud-alsabbagh",
  ],
};

export const metadata: Metadata = {
  title: "منذر الصبّاغ — باحث مستقلّ في الدراسات القرآنية",
  description:
    "منذر الصبّاغ، باحث قرآنيّ مستقلّ من دمشق. خمسة عشر عاماً في تطوير إطار تفسيريّ يعتمد على القرآن من داخله. مؤلّف «أصل الوجود».",
  alternates: { canonical: `${siteConfig.url}/author` },
};

const books = [
  {
    title: siteConfig.workTitle,
    meta: `دمشق ${siteConfig.attributionYear} · ${siteConfig.pages} صفحة`,
    doi: "10.5281/zenodo.21855463",
  },
  {
    title: "نور في زمن الظلام — ليس كل نكاح زواجًا: التمييز التشريعيّ الذي أعادته الآيات",
    meta: "٢٠٢٥ · الإصدارة ٦٫٠",
    doi: "10.5281/zenodo.18049631",
  },
];

const papers = [
  ["الزواج ≠ النكاح: قراءة تدبّرية في سورة النساء (٢٠–٢٥)", "٢٠٢٥", "10.5281/zenodo.16990226"],
  ["حقيقة النصيب والجبت والطاغوت", "٢٠٢٥", "10.5281/zenodo.16936562"],
  ["هل المرأة حقًّا مفردة نساء؟", "٢٠٢٥", "10.5281/zenodo.16889747"],
  ["«تلكما الشجرة»: قراءة بلاغية وجودية", "٢٠٢٥", "10.5281/zenodo.16879050"],
  ["القرآن يعترف بالسنّة — لكن في زمن البعثة", "٢٠٢٥", "10.5281/zenodo.16853910"],
  ["ما بطن من الفواحش", "٢٠٢٥", "10.5281/zenodo.16789852"],
  ["الصلوة في القرآن — بين الطقس والصلة", "٢٠٢٥", "10.5281/zenodo.16790965"],
];

const identifiers = [
  { label: "ORCID", href: siteConfig.orcid },
  { label: "Google Scholar", href: siteConfig.scholar },
  { label: "Zenodo", href: "https://zenodo.org/records/21855464" },
  { label: "Academia.edu", href: siteConfig.academia },
  {
    label: "Internet Archive",
    href: "https://archive.org/details/asl-alwujud-alsabbagh",
  },
];

export default function AuthorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(authorJsonLd) }}
      />
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8 lg:py-12">
        <Breadcrumbs items={[{ label: "عن المؤلّف" }]} />

        <PageHeader
          eyebrow="عن المؤلّف"
          title={siteConfig.author}
          lead="باحثٌ مستقلٌّ في الدراسات القرآنية والفلسفة الإسلامية — دمشق"
        />

        <div className="space-y-12">
          <section>
            <p className="leading-loose text-ink-soft">
              باحثٌ متخصّصٌ في التحليل اللغويّ والبلاغيّ للنصّ القرآنيّ،
              ودراسةِ الخطاب الإلهيّ في اللسان العربيّ المبين.
            </p>
            <p className="mt-4 leading-loose text-ink-soft">
              أعملُ منذ خمسة عشر عاماً على تطوير إطارٍ تفسيريٍّ وجوديٍّ يعتمد
              على القرآن من داخله — القرآن يعضد بعضُه بعضاً — دون الرجوع إلى
              المصادر التراثية أو الفقهية الخارجية. ويتركّز بحثي على التمييز
              التشريعيّ، والدلالة الوظيفية للمصطلحات، والبنية الكونية للخطاب
              الإلهيّ.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-amiri text-2xl font-bold text-ink">
              About
            </h2>
            <p className="leading-loose text-ink-soft">
              <span className="font-semibold text-ink">{siteConfig.authorEn}</span>{" "}
              — Independent Researcher in Qur&apos;anic Studies and Islamic
              Philosophy, Damascus.
            </p>
            <p className="mt-4 leading-loose text-ink-soft" dir="ltr">
              Specializing in the linguistic and rhetorical analysis of the
              Qur&apos;anic text and the study of divine discourse in Classical
              Arabic. For fifteen years I have developed an internal, existential
              interpretive framework based solely on the Qur&apos;an itself — the
              Qur&apos;an interpreting the Qur&apos;an — without reliance on
              classical jurisprudence or external exegetical heritage. My research
              focuses on legislative distinctions, the functional semantics of
              Qur&apos;anic terms, and the cosmic structure of divine discourse.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-amiri text-2xl font-bold text-ink">
              الكتب
            </h2>
            <ul className="space-y-3">
              {books.map((book) => (
                <li
                  key={book.doi}
                  className="rounded-xl border border-line bg-card p-5"
                >
                  <h3 className="font-kufi text-base font-semibold leading-relaxed text-ink">
                    {book.title}
                  </h3>
                  <p className="mt-1 font-kufi text-xs text-ink-faint">
                    {book.meta}
                  </p>
                  <a
                    href={`https://doi.org/${book.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block font-kufi text-xs text-accent transition-colors hover:text-accent-bright"
                  >
                    {book.doi}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-4 font-amiri text-2xl font-bold text-ink">
              الأبحاث
            </h2>
            <div className="overflow-x-auto rounded-xl border border-line">
              <table className="w-full text-right">
                <tbody>
                  {papers.map((p) => (
                    <tr
                      key={p[2]}
                      className="border-t border-line-soft first:border-t-0"
                    >
                      <td className="px-4 py-3 text-sm leading-relaxed text-ink">
                        {p[0]}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-kufi text-xs text-ink-faint">
                        {p[1]}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-kufi text-xs text-accent">
                        <a
                          href={`https://doi.org/${p[2]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:text-accent-bright"
                        >
                          {p[2]}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="mb-4 font-amiri text-2xl font-bold text-ink">
              المعرّفات
            </h2>
            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
              {identifiers.map((id) => (
                <li key={id.label} className="bg-card">
                  <a
                    href={id.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-4 px-4 py-3 text-sm text-ink-soft transition-colors hover:bg-accent-bright/10 hover:text-ink"
                  >
                    <span className="font-kufi font-medium">{id.label}</span>
                    <ExternalLink
                      className="h-4 w-4 shrink-0 text-accent-bright"
                      aria-hidden
                    />
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
