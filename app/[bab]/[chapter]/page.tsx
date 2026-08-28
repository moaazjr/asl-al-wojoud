import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, FileText } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { PrevNextNav } from "@/components/content/prev-next-nav";
import { CopyLinkButton } from "@/components/content/copy-link-button";
import { ReadingProgress } from "@/components/layout/reading-progress";
import { ChapterContent } from "@/components/content/chapter-content";
import { ContentRenderer } from "@/components/content/content-renderer";
import { CitationBox } from "@/components/content/citation-box";
import { SectionComments } from "@/features/discussions/components/section-comments";
import { getAdjacentChapters, getAllChapterSlugs, getBook, getChapter } from "@/lib/content";

export function generateStaticParams() {
  return getAllChapterSlugs().map(({ bookNumber, slug }) => ({
    bab: String(bookNumber),
    chapter: slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bab: string; chapter: string }>;
}): Promise<Metadata> {
  const { bab, chapter } = await params;
  const bookNumber = parseInt(bab, 10);
  const ch = getChapter(bookNumber, chapter);
  if (!ch) return {};
  return {
    title: ch.title,
    description:
      ch.desc ?? `${ch.title} — ${ch.bookTitleOnly} · أصل الوجود`,
    alternates: {
      canonical: `/${ch.bookNumber}/${ch.slug}`,
    },
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ bab: string; chapter: string }>;
}) {
  const { bab, chapter } = await params;
  const bookNumber = parseInt(bab, 10);
  if (Number.isNaN(bookNumber)) notFound();

  const chapterData = getChapter(bookNumber, chapter);
  if (!chapterData) notFound();

  const book = getBook(bookNumber);
  const { prev, next } = getAdjacentChapters(bookNumber, chapter);

  return (
    <>
      <ReadingProgress />

      <Breadcrumbs
        items={[
          { label: book?.titleOnly ?? `الباب ${bookNumber}`, href: `/${bab}` },
          { label: chapterData.title },
        ]}
      />

      <header
        id={chapterData.slug}
        className="group relative mb-8 scroll-mt-24 border-b border-line pb-6"
      >
        <span className="mb-3 inline-block rounded-md bg-accent-soft px-2.5 py-1 font-kufi text-xs font-semibold text-accent">
          {chapterData.num}
        </span>
        <div className="flex items-start gap-2">
          <h1 className="flex-1 font-amiri text-3xl font-bold leading-snug text-ink sm:text-4xl">
            {chapterData.title}
          </h1>
          <CopyLinkButton anchor={chapterData.slug} className="mt-2" />
        </div>
        {chapterData.desc && (
          <p className="mt-3 max-w-2xl font-naskh text-[0.95rem] leading-loose text-ink-soft">
            {chapterData.desc}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-4 font-kufi text-xs text-ink-faint">
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {chapterData.readingTime} دقائق قراءة
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" />~{chapterData.wordCount} كلمة
          </span>
          <span className="flex items-center gap-1.5">
            {chapterData.sections.length} مبحثاً في هذا الفصل
          </span>
        </div>
      </header>

      {chapterData.blocks.length > 0 && (
        <div className="mt-6">
          <ContentRenderer blocks={chapterData.blocks} />
        </div>
      )}
      <ChapterContent sections={chapterData.sections} />

      <div className="mt-10">
        <CitationBox title={chapterData.title} />
      </div>

      <SectionComments
        sectionId={`${bab}/${chapter}`}
        sectionTitle={chapterData.title}
        bookTitle={book?.titleOnly ?? `الباب ${bookNumber}`}
      />

      <PrevNextNav prev={prev} next={next} />
    </>
  );
}