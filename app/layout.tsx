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
import { siteConfig } from "@/data/site";
import { getStats } from "@/lib/content";
import { bookJsonLd } from "@/lib/jsonld";
import "./globals.css";

const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic", "latin"],
  variable: "--font-noto-sans-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s · ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [
    { name: siteConfig.author, url: siteConfig.orcid },
    { name: siteConfig.authorEn, url: siteConfig.orcid },
  ],
  openGraph: {
    type: "website",
    locale: "ar",
    url: siteConfig.url,
    siteName: siteConfig.title,
    title: siteConfig.title,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
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
                      __html: JSON.stringify(bookJsonLd),
                    }}
                  />
                  <Navbar />
                  <ScrollToHash />
                  <ChapterTracker />
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
