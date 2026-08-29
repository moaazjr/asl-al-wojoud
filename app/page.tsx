import type { Metadata } from "next";
import { getStats } from "@/lib/content";
import { HomeHero } from "@/components/home/hero";
import { HomeQuote } from "@/components/home/quote-section";
import { HomeFeatureCards } from "@/components/home/feature-cards";
import { HomeRules } from "@/components/home/rules-section";
import { HomeChapters } from "@/components/home/chapters-section";
import { HomeBookQuote } from "@/components/home/book-quote";
import { HomeHowToRead } from "@/components/home/how-to-read-card";
import { HomeCitation } from "@/components/home/citation-section";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const stats = getStats();

  return (
    <>
      <HomeHero stats={stats} />
      <HomeQuote />
      <HomeFeatureCards />
      <HomeRules />
      <HomeChapters />
      <HomeBookQuote />
      <HomeHowToRead />
      <HomeCitation />
    </>
  );
}
