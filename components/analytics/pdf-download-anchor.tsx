"use client";

import { trackEvent } from "@/lib/gtag";
import { AnchorHTMLAttributes, forwardRef } from "react";

export const PdfDownloadAnchor = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement>
>(({ onClick, ...props }, ref) => {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    trackEvent("pdf_download", { file_name: "full_book_pdf" });
    onClick?.(event);
  };

  return <a ref={ref} {...props} onClick={handleClick} />;
});
PdfDownloadAnchor.displayName = "PdfDownloadAnchor";
