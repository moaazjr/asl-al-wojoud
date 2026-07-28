import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, FileText } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PrevNextNav } from "@/components/content/prev-next-nav";
import { CopyLinkButton } from "@/components/content/copy-link-button";
import { ReadingProgress } from "@/components/layout/reading-progress";
import { DiscussionSurface } from "@/features/discussions/components/discussion-surface";
import {
  getAllSectionSlugs,
  getAdjacent,
  getBook,
  getSection,
} from "@/lib/content";

export function generateStaticParams() {
  return getAllSectionSlugs().map(({ bookNumber, slug }) => ({
    bab: String(bookNumber),
    section: slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bab: string; section: string }>;
}): Promise<Metadata> {
  const { bab, section } = await params;
  const sec = getSection(parseInt(bab, 10), section);
  if (!sec) return {};
  const book = getBook(parseInt(bab, 10));
  return {
    title: sec.title,
    description:
      sec.desc ??
      `${sec.title} — ${book?.titleOnly ?? ""} · أصل الوجود`,
    alternates: {
      canonical: `/${bab}/${section}`,
    },
  };
}

export default async function SectionPage({
  params,
}: {
  params: Promise<{ bab: string; section: string }>;
}) {
  const { bab, section } = await params;
  const bookNumber = parseInt(bab, 10);
  if (Number.isNaN(bookNumber)) notFound();

  const sectionData = getSection(bookNumber, section);
  if (!sectionData) notFound();

  const book = getBook(bookNumber);
  const { prev, next } = getAdjacent(bookNumber, section);

  return (
    <>
      <ReadingProgress />

      <Breadcrumbs
        items={[
          { label: book?.titleOnly ?? `الباب ${bookNumber}`, href: `/${bab}` },
          { label: sectionData.title },
        ]}
      />

      <header className="group relative mb-8 border-b border-line pb-6">
        <span className="mb-3 inline-block rounded-md bg-accent-soft px-2.5 py-1 font-kufi text-xs font-semibold text-accent">
          {sectionData.num}
        </span>
        <div className="flex items-start gap-2">
          <h1 className="flex-1 font-amiri text-3xl font-bold leading-snug text-ink sm:text-4xl">
            {sectionData.title}
          </h1>
          <CopyLinkButton anchor={sectionData.slug} className="mt-2" />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4 font-kufi text-xs text-ink-faint">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {sectionData.readingTime} دقائق قراءة
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />~{sectionData.wordCount} كلمة
          </span>
        </div>
      </header>

      {sectionData.blocks.length > 0 ? (
        <DiscussionSurface
          blocks={sectionData.blocks}
          sectionId={`${bab}/${section}`}
          sectionTitle={sectionData.title}
          bookTitle={book?.titleOnly ?? `الباب ${bookNumber}`}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-line bg-paper-deep/40 p-8 text-center">
          <p className="font-kufi text-sm text-ink-faint">
            هذا مبحثٌ تمهيديٌّ يحيل إلى مباحثه الفرعية. تصفّح الأقسام الفرعية من
            القائمة الجانبية.
          </p>
        </div>
      )}

      <PrevNextNav prev={prev} next={next} />
    </>
  );
}
