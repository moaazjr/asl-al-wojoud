import { DiscussionsManager } from "@/features/dashboard/components/discussions-manager";
import { PageHeader } from "../_components/page-header";
import { VisitorCommentsNotice } from "@/features/dashboard/components/visitor-comments-notice";

export default function DiscussionsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="نقاشات المستخدمين المسجّلين" desc="كل النقاشات التي أنشأها مستخدمون مسجّلون" />
      <VisitorCommentsNotice />
      <DiscussionsManager />
    </div>
  );
}
