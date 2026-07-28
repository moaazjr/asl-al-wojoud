import type { Metadata } from "next";
import { Amiri, Reem_Kufi, Noto_Naskh_Arabic } from "next/font/google";
import { ThemeProvider } from "@/components/providers";
import { SearchProvider } from "@/features/search/search-provider";
import { AuthProvider } from "@/features/auth/auth-provider";
import { AuthDialog } from "@/features/auth/components/auth-dialog";
import { NotificationsProvider } from "@/features/notifications/notifications-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/layout/back-to-top";
import { siteConfig } from "@/data/site";
import "./globals.css";

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-amiri",
  display: "swap",
});

const kufi = Reem_Kufi({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-kufi",
  display: "swap",
});

const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-naskh",
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
  authors: [{ name: siteConfig.author }],
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
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${amiri.variable} ${kufi.variable} ${naskh.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <ThemeProvider>
          <AuthProvider>
            <NotificationsProvider>
              <SearchProvider>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Book",
                name: siteConfig.title,
                description: siteConfig.description,
                inLanguage: "ar",
                author: { "@type": "Person", name: siteConfig.author },
                about: siteConfig.keywords,
              }),
            }}
          />
                <Navbar />
                <div className="flex flex-1 flex-col">{children}</div>
                <Footer />
                <BackToTop />
              </SearchProvider>
              <AuthDialog />
            </NotificationsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
