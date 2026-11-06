import { DiscussionsManager } from "@/features/dashboard/components/discussions-manager";
import { PageHeader } from "../_components/page-header";
import { VisitorCommentsNotice } from "@/features/dashboard/components/visitor-comments-notice";

export default function OpenDiscussionsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="النقاشات المفتوحة" desc="نقاشات المستخدمين المسجّلين التي لم تُغلق بعد" />
      <VisitorCommentsNotice />
      <DiscussionsManager lockFilter="open" />
    </div>
  );
}
