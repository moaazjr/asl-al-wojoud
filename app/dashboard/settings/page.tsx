import { PageHeader } from "../_components/page-header";
import { CommentSettings } from "@/features/dashboard/components/comment-settings";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="الإعدادات" desc="إعدادات التعليقات" />
      <CommentSettings />
    </div>
  );
}
