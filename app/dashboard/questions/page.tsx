import { PageHeader } from "../_components/page-header";
import { QuestionsManager } from "@/features/dashboard/components/questions-manager";

export default function QuestionsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="أسئلة الزوار"
        desc="الأسئلة المرسلة من صفحة «اطرح سؤالك»"
      />
      <QuestionsManager />
    </div>
  );
}
