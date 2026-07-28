import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center px-6 py-32 text-center">
      <span className="font-amiri text-7xl font-bold text-accent">٤٠٤</span>
      <h1 className="mt-4 font-amiri text-3xl font-bold text-ink">
        الصفحة غير موجودة
      </h1>
      <p className="mt-3 font-kufi text-ink-soft">
        ربّما انتقل المبحث أو لم يعد موجوداً. لنعد إلى بداية الكتاب.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">العودة إلى الرئيسية</Link>
      </Button>
    </div>
  );
}
