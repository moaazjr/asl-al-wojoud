"use client";

import * as React from "react";
import type { ContentBlock } from "@/types/content";
import { ContentRenderer } from "@/components/content/content-renderer";
import { useSectionDiscussions } from "../use-section-discussions";
import { SelectionController } from "./selection-controller";
import { DiscussionPanel } from "./discussion-panel";

export function DiscussionSurface({
  blocks,
  sectionId,
  sectionTitle,
  bookTitle,
}: {
  blocks: ContentBlock[];
  sectionId: string;
  sectionTitle: string;
  bookTitle: string;
}) {
  const articleRef = React.useRef<HTMLDivElement>(null);
  const api = useSectionDiscussions(sectionId, { sectionTitle, bookTitle });

  return (
    <>
      <div ref={articleRef}>
        <article className="pb-4">
          <ContentRenderer blocks={blocks} highlights={[]} />
        </article>
      </div>

      <DiscussionPanel api={api} />

      <SelectionController containerRef={articleRef} api={api} />
    </>
  );
}
