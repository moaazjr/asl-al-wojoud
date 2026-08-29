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
  const close = () => setOpen(false);
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
      <SheetContent side="right" className="flex w-[320px] flex-col p-0">
        <SheetHeader className="shrink-0 border-b border-line">
          <SheetTitle className="font-amiri text-xl text-accent">
            {siteConfig.shortName}
          </SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-hidden">
          <SidebarContent books={books} onNavigate={close} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
