import type { Metadata } from "next";
import { MyDiscussions } from "@/features/discussions/components/my-discussions";

export const metadata: Metadata = {
  title: "تعليقاتي",
};

export default function MyDiscussionsPage() {
  return <MyDiscussions />;
}
