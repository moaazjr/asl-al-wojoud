import Link from "next/link";
import { BookOpen } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SearchTrigger } from "@/components/search-trigger";
import { MobileNav } from "@/components/layout/mobile-nav";
import { AuthMenu } from "@/features/auth/components/auth-menu";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { getNavTree } from "@/lib/content";
import { siteConfig } from "@/data/site";

export async function Navbar() {
  const books = getNavTree();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-paper/85 backdrop-blur-md supports-[backdrop-filter]:bg-paper/70">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-1">
          <MobileNav books={books} />
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-lg px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-paper transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
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

        <nav className="flex items-center gap-2">
          <SearchTrigger />
          <Link
            href="/toc"
            className="hidden rounded-lg px-3 py-2 font-kufi text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink md:inline-block"
          >
            الفهرس العام
          </Link>
          <NotificationBell />
          <ThemeToggle />
          <AuthMenu />
        </nav>
      </div>
    </header>
  );
}
