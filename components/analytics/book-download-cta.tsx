import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { FullBookDownloadButton } from "./full-book-download-button";

export function BookDownloadCta({ className }: { className?: string }) {
  return (
    <aside
      aria-label="تحميل الكتاب كاملاً"
      className={cn(
        "mb-8 flex flex-col gap-4 rounded-2xl border border-accent/20 bg-accent-soft/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-paper text-accent">
          <BookOpen className="h-4 w-4" aria-hidden />
        </span>
        <div>
          <p className="font-kufi text-sm font-semibold text-ink">
            اقرأ الكتاب كاملاً دون اتصال
          </p>
          <p className="mt-1 font-kufi text-xs leading-relaxed text-ink-soft">
            نسخة PDF تجمع الأبواب والفصول السبعة في ملف واحد.
          </p>
        </div>
      </div>
      <FullBookDownloadButton className="shrink-0 justify-center">
        حمّل الكتاب كاملاً مجاناً
      </FullBookDownloadButton>
    </aside>
  );
}
