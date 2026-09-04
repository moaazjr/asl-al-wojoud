import Link from "next/link";
import { BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchTrigger } from "@/components/search-trigger";
import { MobileNav } from "@/components/layout/mobile-nav";
import { OnThisPageSheet } from "@/components/content/on-this-page-sheet";
import { AboutProjectDropdown } from "@/components/layout/about-project-dropdown";
import { AuthMenu } from "@/features/auth/components/auth-menu";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { getNavOutline, getNavTree } from "@/lib/content";
import { siteConfig } from "@/data/site";

const navLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "الفهرس", href: "/toc" },
  { label: "فهرس الموضوعات", href: "/subject-index" },
  { label: "التحميل والاستشهاد", href: "/cite" },
] as const;

export async function Navbar() {
  const books = getNavTree();
  const outline = getNavOutline();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-line/70 bg-paper/90 backdrop-blur-md supports-[backdrop-filter]:bg-paper/80">
      <div className="mx-auto grid h-16 max-w-[1400px] grid-cols-[auto_1fr_auto] items-center gap-2 px-4 sm:px-6">
        <div className="flex items-center gap-1">
          <MobileNav books={books} />
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-lg px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-card text-accent transition-colors group-hover:border-accent/50">
              <BookOpen className="h-[1.15rem] w-[1.15rem]" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-amiri text-xl font-bold text-ink">
                {siteConfig.shortName}
              </span>
              <span className="hidden font-kufi text-[0.7rem] text-ink-faint sm:block">
                {siteConfig.subtitle}
              </span>
            </span>
          </Link>
        </div>

        <nav className="hidden items-center justify-center gap-1 md:flex" aria-label="التنقل الرئيسي">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 font-kufi text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          <AboutProjectDropdown />
        </nav>

        <div className="flex items-center justify-end gap-1">
          <SearchTrigger />
          <NotificationBell />
          <ThemeToggle />
          <AuthMenu />
          <OnThisPageSheet books={outline} />
        </div>
      </div>
    </header>
  );
}
