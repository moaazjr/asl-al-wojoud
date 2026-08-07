import { DiscussionsManager } from "@/features/dashboard/components/discussions-manager";
import { PageHeader } from "../_components/page-header";

export default function DiscussionsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="كل التعليقات" desc="إدارة جميع تعليقات الكتاب" />
      <DiscussionsManager />
    </div>
  );
}
