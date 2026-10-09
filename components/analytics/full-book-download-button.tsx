"use client";

import type { AnchorHTMLAttributes } from "react";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/gtag";

export const FULL_BOOK_PDF_PATH = "/download/full-book";
export const FULL_BOOK_PDF_FILE_NAME = "asl-al-wojoud.pdf";

const BASE_STYLES =
  "inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-kufi text-sm font-semibold text-paper transition-colors hover:bg-accent-bright";

export function FullBookDownloadButton({
  className,
  children,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={FULL_BOOK_PDF_PATH}
      download={FULL_BOOK_PDF_FILE_NAME}
      onClick={(event) => {
        trackEvent("pdf_download", {
          file_name: FULL_BOOK_PDF_FILE_NAME,
          content_type: "full_book",
        });
        onClick?.(event);
      }}
      className={cn(BASE_STYLES, className)}
      {...props}
    >
      {children ?? (
        <>
          <Download className="h-4 w-4" aria-hidden />
          حمّل الكتاب كاملاً (PDF)
        </>
      )}
    </a>
  );
}
