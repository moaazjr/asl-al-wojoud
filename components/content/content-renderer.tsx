import * as React from "react";
import type { ContentBlock } from "@/types/content";
import { cn } from "@/lib/utils";

const citationRe = /(\[[^\]]+\])/g;

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

export function ContentRenderer({
  blocks,
}: {
  blocks: ContentBlock[];
}) {
  return (
    <div className="space-y-5">
      {blocks.map((block, i) => {
        if (block.type === "callout") {
          const display = block.citation
            ? block.text.replace(/\[\s*[^\[\]:]+?\s*:\s*[^\[\]]+?\s*\]/, "").trim()
            : block.text;
          return (
            <figure
              key={i}
              className="my-7 rounded-s-lg border-s-[3px] border-accent-bright bg-accent-soft/50 ps-5 pe-4 py-3"
            >
              <p className="font-amiri text-[1.15rem] leading-[2.1] text-ink">
                {renderParagraph(display || block.text)}
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
              className={cn(
                "space-y-2 ps-6 font-naskh leading-[2] marker:font-kufi marker:text-sm marker:font-semibold marker:text-accent-bright",
                block.ordered ? "list-decimal" : "list-disc",
              )}
            >
              {(block.items ?? []).map((item, j) => (
                <li
                  key={j}
                  className="text-[1.02rem] leading-[2]"
                >
                  {renderParagraph(item)}
                </li>
              ))}
            </Tag>
          );
        }

        return (
          <p
            key={i}
            className="text-[1.05rem] leading-[2.05] text-ink"
          >
            {renderParagraph(block.text)}
          </p>
        );
      })}
    </div>
  );
}