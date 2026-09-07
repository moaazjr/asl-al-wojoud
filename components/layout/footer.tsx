import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { siteConfig } from "@/data/site";
import { getStats } from "@/lib/content";

const indexLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "الفهرس العام", href: "/toc" },
  { label: "كيف تقرأ هذا الكتاب", href: "/how-to-read" },
  { label: "التحميل والاستشهاد", href: "/cite" },
] as const;

const projectLinks = [
  { label: "المنهج — أربع قواعد", href: "/method" },
  { label: "فكرة المشروع وأسبابه", href: "/about-project" },
  { label: "عن المؤلّف", href: "/author" },
  { label: "حدود هذا المشروع", href: "/limits" },
  { label: "اتّصل بنا", href: "/ask" },
] as const;

export async function Footer() {
  const stats = getStats();
  return (
    <footer className="bg-[#1d1710] text-[#e8dfcb]">
      <div className="mx-auto max-w-[1400px] px-6 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href="/"
              className="font-amiri text-2xl font-bold text-[#e6c470]"
            >
              {siteConfig.shortName}
            </Link>
            <p className="mt-3 max-w-xs font-amiri text-lg leading-relaxed text-[#cfc4ab]">
              {siteConfig.workTitle}
            </p>
            <p className="mt-4 font-kufi text-sm text-[#a99c83]">
              تأليف{" "}
              <Link
                href={siteConfig.aboutPath}
                className="font-semibold text-[#e6c470] transition-colors hover:text-[#f0d68a]"
              >
                {siteConfig.author}
              </Link>{" "}
              — {siteConfig.attributionPlace} {siteConfig.attributionYear}
            </p>
          </div>

          <nav aria-label="الفهرس">
            <h2 className="mb-4 font-kufi text-sm font-semibold tracking-wide text-[#e6c470]">
              الفهرس
            </h2>
            <ul className="space-y-2.5">
              {indexLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-kufi text-sm text-[#cfc4ab] transition-colors hover:text-[#e6c470]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="عن المشروع">
            <h2 className="mb-4 font-kufi text-sm font-semibold tracking-wide text-[#e6c470]">
              عن المشروع
            </h2>
            <ul className="space-y-2.5">
              {projectLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-kufi text-sm text-[#cfc4ab] transition-colors hover:text-[#e6c470]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-4 font-kufi text-sm font-semibold tracking-wide text-[#e6c470]">
              التواصل والحقوق
            </h2>
            <div className="space-y-2.5 font-kufi text-sm text-[#cfc4ab]">
              <div>
                <span className="text-[#a99c83]">DOI: </span>
                <a
                  href={siteConfig.doi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-[#e6c470]"
                  dir="ltr"
                >
                  10.5281/zenodo.21855463
                </a>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                <a
                  href={siteConfig.orcid}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-[#e6c470]"
                >
                  ORCID <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
                <a
                  href={siteConfig.scholar}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-[#e6c470]"
                >
                  Google Scholar <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
                <a
                  href={siteConfig.academia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 transition-colors hover:text-[#e6c470]"
                >
                  Academia.edu <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
              </div>
              <p className="pt-2 text-sm leading-relaxed text-[#a99c83]">
                رخّص: المشاع الإبداعي — النسب، غير تجاريّ، بلا اشتقاق
                (CC BY-NC-ND 4.0)
              </p>
            </div>


          </div>

        </div>
      </div>

      <div className="border-t border-[#3a2f21]">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 px-6 py-6 text-center font-kufi text-xs text-[#a99c83] sm:flex-row sm:text-start">
          <p>
            {stats.books} أبواب · {stats.sections} مبحثاً · ~
            {Math.round(stats.words / 1000)} ألف كلمة
          </p>
          <p>مشروعٌ مفتوحٌ للتدبّر القرآنيّ — مطروحٌ للنقاش والنقد العلميّ</p>
        </div>
      </div>
    </footer>
  );
}
