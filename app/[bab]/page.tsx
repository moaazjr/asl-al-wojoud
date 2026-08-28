import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { SectionList } from "@/components/content/section-list";
import { Button } from "@/components/ui/button";
import { getBook } from "@/lib/content";

export function generateStaticParams() {
  return Array.from({ length: 7 }, (_, i) => ({ bab: String(i + 1) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ bab: string }>;
}): Promise<Metadata> {
  const { bab } = await params;
  const book = getBook(parseInt(bab, 10));
  if (!book) return {};
  return {
    title: book.titleOnly,
    description: `بابٌ من ${book.title} يضمّ ${book.sectionCount} مبحثاً.`,
    alternates: { canonical: `/${book.number}` },
  };
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ bab: string }>;
}) {
  const { bab } = await params;
  const bookNumber = parseInt(bab, 10);
  const book = getBook(bookNumber);
  if (!book || Number.isNaN(bookNumber)) notFound();

  return (
    <>
      <Breadcrumbs items={[{ label: book.titleOnly }]} />

      <header className="mb-10 border-b border-line pb-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent font-kufi text-2xl font-bold text-paper">
            {book.titleArabic}
          </span>
          <span className="font-kufi text-sm text-ink-faint">
            {book.sectionCount} مبحثاً
          </span>
        </div>
        <h1 className="font-amiri text-4xl font-bold leading-tight text-ink sm:text-5xl">
          {book.titleOnly}
        </h1>
      </header>

      <SectionList
        sections={book.sections}
        bookNumber={bookNumber}
        anchor
      />

      <div className="mt-10 flex justify-start">
        <Button asChild variant="outline">
          <Link href="/toc">
            عرض الفهرس الكامل
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </>
  );
}
