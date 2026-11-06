import { DiscussionsManager } from "@/features/dashboard/components/discussions-manager";
import { PageHeader } from "../_components/page-header";
import { VisitorCommentsNotice } from "@/features/dashboard/components/visitor-comments-notice";

export default function ResolvedDiscussionsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="النقاشات المغلقة" desc="نقاشات المستخدمين المسجّلين التي أُغلقت" />
      <VisitorCommentsNotice />
      <DiscussionsManager lockFilter="resolved" />
    </div>
  );
}
