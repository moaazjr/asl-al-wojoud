import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { getSubjectIndex } from "@/lib/content";
import type { SubjectIndexEntry } from "@/lib/content";

export const metadata: Metadata = {
  title: "فهرس الموضوعات",
  description: "فهرسٌ تفصيليٌّ مشروح لموضوعات كتاب أصل الوجود باباً فباباً وفصلاً ففصلاً.",
  alternates: { canonical: "/subject-index" },
};

interface BabGroup {
  title: string;
  entries: SubjectIndexEntry[];
}

function groupByBab(items: SubjectIndexEntry[]): BabGroup[] {
  const groups: BabGroup[] = [];
  for (const item of items) {
    if (item.type === "bab") {
      groups.push({ title: item.title!, entries: [] });
    } else if (groups.length > 0) {
      groups[groups.length - 1].entries.push(item);
    }
  }
  return groups;
}

const levelIndent: Record<number, string> = {
  2: "ps-0",
  3: "ps-5",
  4: "ps-10",
};

const levelBorder: Record<number, string> = {
  2: "",
  3: "border-r-2 border-line-soft",
  4: "border-r border-line-soft/60",
};

export default function SubjectIndexPage() {
  const items = getSubjectIndex();
  const groups = groupByBab(items);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-8 lg:py-12">
      <Breadcrumbs items={[{ label: "فهرس الموضوعات" }]} />

      <header className="mb-10 border-b border-line pb-8 text-center">
        <span className="font-kufi text-xs font-medium uppercase tracking-[0.2em] text-accent-bright">
          الفهرس التفصيلي
        </span>
        <h1 className="mt-3 font-amiri text-4xl font-bold text-ink sm:text-5xl">
          فهرس الموضوعات
        </h1>
        <p className="mx-auto mt-4 max-w-xl leading-loose text-ink-soft">
          فهرسٌ تفصيليٌّ مشروح يسير على ترتيب الكتاب باباً فباباً وفصلاً
          ففصلاً، ويغوص إلى النقاط الفرعية التي لا تظهر في الفهرس العام.
        </p>
      </header>

      <div className="space-y-10">
        {groups.map((group) => (
          <section key={group.title}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="font-amiri text-2xl font-bold text-ink">
                {group.title}
              </h2>
            </div>
            <div className="rounded-xl border border-line bg-card px-5">
              <ul className="divide-y divide-line-soft">
                {group.entries.map((item, i) => {
                  if (item.type === "note") {
                    return (
                      <li key={`note-${i}`} className="py-3">
                        <p className="text-sm leading-relaxed text-ink-faint italic">
                          {item.text}
                        </p>
                      </li>
                    );
                  }

                  const indent = levelIndent[item.level!] ?? "ps-5";
                  const border = levelBorder[item.level!] ?? "border-r border-line-soft";

                  return (
                    <li key={item.num}>
                      <Link
                        href={item.link!}
                        className={`group flex items-start gap-3 py-4 transition-colors hover:bg-paper-deep/50 ${indent} ${border}`}
                      >
                        <span className="mt-0.5 shrink-0 font-kufi text-xs font-semibold text-accent-bright">
                          {item.num}
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block font-kufi text-base font-medium text-ink transition-colors group-hover:text-accent">
                            {item.title}
                          </span>
                          {item.summary && (
                            <span className="mt-1 block text-sm leading-relaxed text-ink-soft line-clamp-2">
                              {item.summary}
                            </span>
                          )}
                        </div>
                        <ArrowLeft className="mt-1 h-4 w-4 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 flex justify-start">
        <Link
          href="/toc"
          className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 font-kufi text-sm font-medium text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
        >
          عرض الفهرس العام
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
