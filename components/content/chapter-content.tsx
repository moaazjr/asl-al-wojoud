import type { ChapterSection } from "@/lib/content";
import { cn } from "@/lib/utils";
import { ContentRenderer } from "./content-renderer";

const HEADING_CLASS: Record<number, string> = {
  2: "mb-4 mt-12 border-b border-line-soft pb-3 font-amiri text-2xl font-bold leading-snug text-ink",
  3: "mb-3 mt-10 font-amiri text-xl font-bold leading-snug text-ink",
  4: "mb-3 mt-8 font-kufi text-base font-bold leading-snug text-ink",
};

const SCROLL_MARGIN = "scroll-mt-24 md:scroll-mt-28";

function SectionBlock({
  section,
  headingLevel,
}: {
  section: ChapterSection;
  headingLevel: number;
}) {
  const Tag = `h${headingLevel}` as "h2" | "h3" | "h4";

  return (
    <section>
      <Tag
        id={section.slug}
        className={cn(HEADING_CLASS[headingLevel], SCROLL_MARGIN)}
      >
        <span className="me-2 align-middle font-kufi text-xs font-semibold text-accent-bright">
          {section.num}
        </span>
        {section.title}
      </Tag>
      {section.desc && (
        <p className="mb-4 font-naskh text-[0.95rem] leading-loose text-ink-soft">
          {section.desc}
        </p>
      )}
      {section.blocks.length > 0 && (
        <ContentRenderer blocks={section.blocks} />
      )}
      {section.children.map((child) => (
        <SectionBlock
          key={child.num}
          section={child}
          headingLevel={Math.min(headingLevel + 1, 4)}
        />
      ))}
    </section>
  );
}

export function ChapterContent({
  sections,
}: {
  sections: ChapterSection[];
}) {
  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <SectionBlock key={section.num} section={section} headingLevel={2} />
      ))}
    </div>
  );
}