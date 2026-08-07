import { Sidebar } from "@/components/layout/sidebar";
import { BabShell } from "@/components/layout/bab-shell";
import { getNavOutline, getNavTree } from "@/lib/content";

export default async function BabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const books = getNavTree();
  const outline = getNavOutline();
  return (
    <BabShell sidebar={<Sidebar books={books} />} outline={outline}>
      {children}
    </BabShell>
  );
}