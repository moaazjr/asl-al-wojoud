import * as React from "react";
import type { ContentBlock } from "@/types/content";
import { cn } from "@/lib/utils";

const citationRe = /(\[[^\]]+\])/g;

export interface HighlightMark {
  blockIndex: number;
  charStart: number;
  charEnd: number;
  id: string;
}

interface Range {
  start: number;
  end: number;
}

function mergeRanges(ranges: Range[]): Range[] {
  if (ranges.length === 0) return [];
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const out: Range[] = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const last = out[out.length - 1];
    if (sorted[i].start <= last.end) {
      last.end = Math.max(last.end, sorted[i].end);
    } else {
      out.push({ ...sorted[i] });
    }
  }
  return out;
}

function renderParagraph(text: string) {
  const parts = text.split(citationRe);
  return parts.map((part, i) => {
    if (part.startsWith("[") && part.endsWith("]")) {
      return (
        <cite key={i} className="font-kufi text-[0.82em] text-accent not-italic">
          {part}
        </cite>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function renderHighlightedText(text: string, marks: HighlightMark[]) {
  const ranges = mergeRanges(
    marks.map((m) => ({ start: m.charStart, end: m.charEnd })),
  );
  if (ranges.length === 0) return renderParagraph(text);

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  for (let i = 0; i < ranges.length; i++) {
    const start = Math.max(ranges[i].start, cursor);
    const end = ranges[i].end;
    if (start > cursor) {
      nodes.push(
        <React.Fragment key={`p${i}`}>
          {renderParagraph(text.slice(cursor, start))}
        </React.Fragment>,
      );
    }
    nodes.push(
      <mark
        key={`m${i}`}
        className="discussion-mark rounded-[3px] bg-accent/25 px-0.5 text-ink decoration-accent-bright underline decoration-dotted underline-offset-4 transition-colors"
      >
        {renderParagraph(text.slice(start, end))}
      </mark>,
    );
    cursor = Math.max(cursor, end);
  }
  if (cursor < text.length) {
    nodes.push(
      <React.Fragment key="tail">
        {renderParagraph(text.slice(cursor))}
      </React.Fragment>,
    );
  }
  return nodes;
}

export function ContentRenderer({
  blocks,
  highlights,
}: {
  blocks: ContentBlock[];
  highlights?: HighlightMark[];
}) {
  const marksByBlock = (() => {
    const map = new Map<number, HighlightMark[]>();
    for (const m of highlights ?? []) {
      const arr = map.get(m.blockIndex) ?? [];
      arr.push(m);
      map.set(m.blockIndex, arr);
    }
    return map;
  })();

  let unitIndex = 0;
  const take = () => unitIndex++;
  const marksFor = (idx: number) => marksByBlock.get(idx) ?? [];

  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        if (block.type === "callout") {
          const idx = take();
          const display = block.citation
            ? block.text.replace(/\[\s*[^\[\]:]+?\s*:\s*[^\[\]]+?\s*\]/, "").trim()
            : block.text;
          return (
            <figure
              key={i}
              data-block-index={idx}
              className="my-7 rounded-s-lg border-s-[3px] border-accent-bright bg-accent-soft/50 ps-5 pe-4 py-3"
            >
              <p className="font-amiri text-[1.15rem] leading-[2.1] text-ink">
                {renderHighlightedText(display || block.text, marksFor(idx))}
              </p>
              {block.citation && (
                <figcaption className="mt-3 font-kufi text-xs text-accent-bright">
                  ﴿{block.citation.surah}: {block.citation.ayah}﴾
                </figcaption>
              )}
            </figure>
          );
        }

        if (block.type === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return (
            <Tag
              key={i}
              data-block-index={-1}
              className={cn(
                "space-y-2 ps-6 font-naskh leading-[2] marker:font-kufi marker:text-sm marker:font-semibold marker:text-accent-bright",
                block.ordered ? "list-decimal" : "list-disc",
              )}
            >
              {block.items?.map((item, j) => {
                const idx = take();
                return (
                  <li
                    key={j}
                    data-block-index={idx}
                    className="text-[1.02rem] leading-[2]"
                  >
                    {renderHighlightedText(item, marksFor(idx))}
                  </li>
                );
              })}
            </Tag>
          );
        }

        const idx = take();
        return (
          <p
            key={i}
            data-block-index={idx}
            className="text-[1.05rem] leading-[2.05] text-ink"
          >
            {renderHighlightedText(block.text, marksFor(idx))}
          </p>
        );
      })}
    </div>
  );
}
