import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { AdminAnalytics } from "@/features/analytics/components/admin-analytics";
import { getCurrentUser } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "تحليلات الموقع",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") redirect("/dashboard");

  return (
    <DashboardShell>
      <AdminAnalytics />
    </DashboardShell>
  );
}
