import { Sidebar } from "@/components/layout/sidebar";

export default function BabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-1">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-8 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
