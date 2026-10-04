"use client";

import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/gtag";
import { ComponentProps } from "react";

type PdfTrackButtonProps = ComponentProps<typeof Button> & {
  href?: string;
  target?: string;
  rel?: string;
};

export function PdfTrackButton({
  onClick,
  href,
  target,
  rel,
  ...props
}: PdfTrackButtonProps) {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    trackEvent("pdf_download");
    onClick?.(event);
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      asChild={Boolean(href)}
    >
      {href ? (
        <a href={href} target={target} rel={rel}>
          {props.children}
        </a>
      ) : (
        props.children
      )}
    </Button>
  );
}
