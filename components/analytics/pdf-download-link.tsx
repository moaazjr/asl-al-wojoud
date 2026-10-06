"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/gtag";
import { ComponentProps, forwardRef } from "react";

type Props = ComponentProps<typeof Link>;

export const PdfDownloadLink = forwardRef<HTMLAnchorElement, Props>(
  ({ onClick, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      trackEvent("pdf_download", { file_name: "full_book_pdf" });
      onClick?.(event);
    };

    return <Link ref={ref} {...props} onClick={handleClick} />;
  },
);
PdfDownloadLink.displayName = "PdfDownloadLink";
