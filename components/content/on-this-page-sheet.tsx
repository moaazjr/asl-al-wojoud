"use client";

import * as React from "react";
import { ListTree, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { OutlineBook } from "@/lib/content";
import { OnThisPageNav, useOnThisPage } from "./on-this-page";

export function OnThisPageSheet({ books }: { books: OutlineBook[] }) {
  const [open, setOpen] = React.useState(false);
  const { items, activeId, handleClick } = useOnThisPage(books);

  if (items.length === 0) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="فتح قائمة محتويات الصفحة"
          className="-me-1 inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink xl:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] p-0">
        <SheetHeader className="border-b border-line">
          <SheetTitle className="flex items-center gap-1.5 font-kufi text-xs font-semibold text-ink-faint">
            <ListTree className="h-4 w-4 text-accent" />
            على هذه الصفحة
          </SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100dvh-5.5rem)] overflow-y-auto px-2 py-4">
          <OnThisPageNav
            items={items}
            activeId={activeId}
            onNavigate={(item) => {
              handleClick(item);
              setOpen(false);
            }}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}