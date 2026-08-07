"use client";

import { useSectionDiscussions } from "../use-section-discussions";
import { CommentsSection } from "./comments-section";

export function SectionComments({
  sectionId,
  sectionTitle,
  bookTitle,
}: {
  sectionId: string;
  sectionTitle: string;
  bookTitle: string;
}) {
  const api = useSectionDiscussions(sectionId, { sectionTitle, bookTitle });

  return <CommentsSection api={api} />;
}