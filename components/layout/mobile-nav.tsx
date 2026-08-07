"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarContent } from "@/components/layout/sidebar-content";
import type { NavBook } from "@/lib/content";
import { siteConfig } from "@/data/site";

export function MobileNav({ books }: { books: NavBook[] }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="فتح قائمة التنقل"
          className="-ms-2 inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-0">
        <SheetHeader className="border-b border-line">
          <SheetTitle className="font-amiri text-xl text-accent">
            {siteConfig.shortName}
          </SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100dvh-5.5rem)]">
          <SidebarContent books={books} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
