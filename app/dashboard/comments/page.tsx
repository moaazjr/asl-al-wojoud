
import { PageHeader } from "../_components/page-header";
import { PublicCommentsManager } from "@/features/dashboard/components/public-comments-manager";

export default function CommentsModerationPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="تعليقات الزوّار"
        desc="مراجعة تعليقات الزوّار والموافقة عليها أو رفضها والردّ عليها"
      />
      <PublicCommentsManager />
    </div>
  );
}
