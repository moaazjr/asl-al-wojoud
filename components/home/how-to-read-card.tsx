import Link from "next/link";
import { BookMarked } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

export function HomeHowToRead() {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-4xl px-6 py-20 sm:py-24">
        <FadeIn>
          <div className="flex flex-col gap-6 rounded-2xl border border-accent/25 bg-[#f3ecdc] p-8 sm:flex-row sm:items-center sm:gap-8 sm:p-10">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-paper">
              <BookMarked className="h-7 w-7" aria-hidden />
            </span>
            <div className="flex-1 text-center sm:text-start">
              <h2 className="font-amiri text-2xl font-bold text-ink sm:text-3xl">
                كيف تقرأ هذا الكتاب
              </h2>
              <p className="mt-3 leading-relaxed text-ink-soft">
                هذا الكتاب مبنيٌّ بعضُه على بعض، لا تنفصل فيه مسألةٌ عن
                مواضعها، فحقُّه في القراءة أن يُتلقّى جملةً واحدة، لا أن
                يُقتطَع منه فصلٌ فيُحاكَم وحده. فابدأ بالباب الأول — فهو
                الأساس لا التمهيد.
              </p>
              <Link
                href="/how-to-read"
                className="mt-5 inline-flex items-center gap-1.5 font-kufi text-sm font-semibold text-accent transition-colors hover:text-accent-bright"
              >
                تعرّف على أربع إرشادات في القراءة
                <span aria-hidden>←</span>
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
