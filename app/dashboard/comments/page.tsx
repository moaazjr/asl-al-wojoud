
import { PageHeader } from "../_components/page-header";
import { PublicCommentsManager } from "@/features/dashboard/components/public-comments-manager";

export default function CommentsModerationPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="تعديل التعليقات"
        desc="مراجعة وموافقة على تعليقات الزوار"
      />
      <PublicCommentsManager />
    </div>
  );
}
