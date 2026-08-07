"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { OnThisPage } from "@/components/content/on-this-page";
import type { OutlineBook } from "@/lib/content";
import { cn } from "@/lib/utils";

export function BabShell({
  sidebar,
  outline,
  children,
}: {
  sidebar: ReactNode;
  outline: OutlineBook[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isTopic = pathname.split("/").filter(Boolean).length >= 2;

  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1">
      {!isTopic && sidebar}
      <main className="min-w-0 flex-1">
        <div
          className={cn(
            "me-auto w-full px-4 py-8 sm:px-8 lg:py-12",
            isTopic ? "max-w-4xl" : "max-w-3xl",
          )}
        >
          {children}
        </div>
      </main>
      <OnThisPage books={outline} />
    </div>
  );
}