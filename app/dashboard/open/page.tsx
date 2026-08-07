import { DiscussionsManager } from "@/features/dashboard/components/discussions-manager";
import { PageHeader } from "../_components/page-header";

export default function OpenDiscussionsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="التعليقات المفتوحة" desc="التعليقات التي تنتظر ردّ المشرف" />
      <DiscussionsManager lockFilter="open" />
    </div>
  );
}
