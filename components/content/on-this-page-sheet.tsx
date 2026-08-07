"use client";

import * as React from "react";
import { ListTree, ChevronLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { OutlineBook } from "@/lib/content";
import { cn } from "@/lib/utils";
import { OnThisPageNav, useOnThisPage } from "./on-this-page";

export function OnThisPageSheet({ books }: { books: OutlineBook[] }) {
  const [open, setOpen] = React.useState(false);
  const { items, activeId, handleClick } = useOnThisPage(books);

  if (items.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="فتح قائمة محتويات الصفحة"
        className="fixed left-2 top-[50%] z-50 flex h-9 w-9 items-center justify-center rounded-full border border-line bg-card text-ink-soft shadow-lift transition-colors hover:text-accent lg:hidden"
        // className="fixed left-2 top-[60%] z-50 flex h-9 w-9 -mt-100 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-card text-ink-soft shadow-lift transition-colors hover:text-accent lg:hidden"
      >
        <ChevronLeft
          className={cn(
            "h-5 w-5 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
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
    </>
  );
}