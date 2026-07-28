import { Settings, Wrench } from "lucide-react";
import { PageHeader } from "../_components/page-header";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="الإعدادات" desc="إعدادات النظام" />
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-line bg-card py-16 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Settings className="h-7 w-7" />
        </span>
        <h2 className="font-kufi text-lg font-bold text-ink">قريبًا</h2>
        <p className="max-w-xs font-kufi text-sm text-ink-faint">
          ستظهر هنا إعدادات المنصة قريبًا.
        </p>
        <span className="inline-flex items-center gap-1 font-kufi text-xs text-ink-faint">
          <Wrench className="h-3.5 w-3.5" />
          صفحة مخصّصة للاستخدام المستقبلي
        </span>
      </div>
    </div>
  );
}
