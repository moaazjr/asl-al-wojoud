import { siteConfig } from "@/data/site";

const shareImage = {
  url: "/og-cover.jpg",
  width: 1200,
  height: 630,
  alt: `غلاف كتاب ${siteConfig.title} — تأليف ${siteConfig.author}`,
  type: "image/jpeg",
};

export const ogImages = [shareImage];

export const twitterShare = {
  card: "summary_large_image" as const,
  images: [{ url: shareImage.url, alt: shareImage.alt }],
};
