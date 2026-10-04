"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/gtag";
import { ComponentProps, forwardRef } from "react";

type PdfTrackLinkProps = ComponentProps<typeof Link> & {
  onTracked?: () => void;
};

export const PdfTrackLink = forwardRef<HTMLAnchorElement, PdfTrackLinkProps>(
  ({ onClick, onTracked, ...props }, ref) => {
    const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
      trackEvent("pdf_download");
      onTracked?.();
      onClick?.(event);
    };

    return <Link ref={ref} {...props} onClick={handleClick} />;
  },
);
PdfTrackLink.displayName = "PdfTrackLink";
