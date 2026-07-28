import { DiscussionsManager } from "@/features/dashboard/components/discussions-manager";
import { PageHeader } from "../_components/page-header";

export default function ResolvedDiscussionsPage() {
  return (
    <div className="space-y-4">
      <PageHeader title="النقاشات المغلقة" desc="النقاشات التي تمّ حلّها" />
      <DiscussionsManager lockFilter="resolved" />
    </div>
  );
}
