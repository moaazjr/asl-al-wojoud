import { getNavTree } from "@/lib/content";
import { SidebarContent } from "@/components/layout/sidebar-content";

export async function Sidebar() {
  const books = getNavTree();
  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-80 shrink-0 border-e border-line bg-paper/40 lg:block">
      <SidebarContent books={books} />
    </aside>
  );
}
