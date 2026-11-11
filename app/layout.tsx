import type { Metadata } from "next";
import { Noto_Sans_Arabic } from "next/font/google";
import { ThemeProvider } from "@/components/providers";
import { SearchProvider } from "@/features/search/search-provider";
import { AuthProvider } from "@/features/auth/auth-provider";
import { AuthDialog } from "@/features/auth/components/auth-dialog";
import { SettingsProvider } from "@/features/settings/settings-context";
import { NotificationsProvider } from "@/features/notifications/notifications-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/layout/back-to-top";
import { ScrollToHash } from "@/components/layout/scroll-to-hash";
import { GoogleAdsTag } from "@/components/analytics/google-ads-tag";
import { ChapterTracker } from "@/components/analytics/chapter-tracker";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { siteConfig } from "@/data/site";
import { ogImages, twitterShare } from "@/lib/share-image";
import { getStats } from "@/lib/content";
import { bookJsonLd, serializeJsonLd } from "@/lib/jsonld";
import "./globals.css";

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-noto-sans-arabic",
  display: "swap",
});

const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const bingSiteVerification =
  process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.seoTitle,
    template: `%s · ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.title,
  keywords: [...siteConfig.keywords],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  category: "religion",
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, email: false, address: false },
  authors: [
    { name: siteConfig.author, url: siteConfig.orcid },
    { name: siteConfig.authorEn, url: siteConfig.orcid },
  ],
  openGraph: {
    type: "website",
    locale: "ar_AR",
    url: siteConfig.url,
    siteName: siteConfig.title,
    title: siteConfig.seoTitle,
    description: siteConfig.description,
    images: ogImages,
  },
  twitter: {
    ...twitterShare,
    title: siteConfig.seoTitle,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  verification: {
    google: googleSiteVerification,
    other: bingSiteVerification
      ? { "msvalidate.01": bingSiteVerification }
      : undefined,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const stats = getStats();
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${notoSansArabic.variable}`}
    >
      <head>
        <GoogleAdsTag />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <AuthProvider>
            <SettingsProvider>
              <NotificationsProvider>
                <SearchProvider sectionCount={stats.sections}>
                  <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                      __html: serializeJsonLd(bookJsonLd),
                    }}
                  />
                  <Navbar />
                  <ScrollToHash />
                  <ChapterTracker />
                  <PageViewTracker />
                  <div className="flex flex-1 flex-col">{children}</div>
                  <Footer />
                  <BackToTop />
                </SearchProvider>
                <AuthDialog />
              </NotificationsProvider>
            </SettingsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
