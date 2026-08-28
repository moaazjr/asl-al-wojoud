import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Blockquote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-6 border-e-[3px] border-accent-bright bg-card px-5 py-4 font-amiri text-lg italic leading-[1.9] text-accent sm:px-7">
      {children}
    </blockquote>
  );
}

export function PageHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="mb-10 border-b border-line pb-8 text-center">
      <span className="font-kufi text-xs font-medium uppercase tracking-[0.2em] text-accent-bright">
        {eyebrow}
      </span>
      <h1 className="mt-3 font-amiri text-4xl font-bold text-ink sm:text-5xl">
        {title}
      </h1>
      {lead && (
        <p className={cn("mx-auto mt-4 max-w-2xl font-kufi text-sm leading-loose text-ink-soft")}>
          {lead}
        </p>
      )}
    </header>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}
