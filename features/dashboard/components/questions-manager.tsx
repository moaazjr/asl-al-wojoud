"use client";

import * as React from "react";
import {
  HelpCircle,
  Loader2,
  Mail,
  MailOpen,
  Search,
  Trash2,
} from "lucide-react";
import type { Question } from "@/interfaces/types";
import { formatRelativeTime } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  deleteQuestion,
  listQuestions,
  updateQuestion,
} from "@/features/questions/api";

export function QuestionsManager() {
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [tab, setTab] = React.useState<"unread" | "all">("unread");
  const [notice, setNotice] = React.useState<string | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const requestRef = React.useRef(0);

  const load = React.useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setLoadError(null);
    try {
      const next = await listQuestions();
      if (requestId !== requestRef.current) return;
      setQuestions(next);
    } catch {
      if (requestId !== requestRef.current) return;
      setLoadError("تعذّر تحميل الأسئلة. حاول تحديث الصفحة.");
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const run = async () => {
      await load();
    };
    void run();
  }, [load]);

  async function handleToggleRead(question: Question) {
    setBusyId(question.id);
    setNotice(null);
    setLoadError(null);
    try {
      const updated = await updateQuestion(question.id, !question.isRead);
      setQuestions((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item)),
      );
      setNotice(updated.isRead ? "تم تمييز السؤال كمقروء." : "تم تمييز السؤال كغير مقروء.");
    } catch {
      setLoadError("تعذّر تحديث السؤال. حاول مرة أخرى.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل تريد حذف هذا السؤال نهائيًا؟")) return;
    setBusyId(id);
    setNotice(null);
    setLoadError(null);
    try {
      await deleteQuestion(id);
      setQuestions((prev) => prev.filter((item) => item.id !== id));
      setNotice("تم حذف السؤال.");
    } catch {
      setLoadError("تعذّر حذف السؤال. حاول مرة أخرى.");
    } finally {
      setBusyId(null);
    }
  }

  const unreadCount = React.useMemo(
    () => questions.filter((item) => !item.isRead).length,
    [questions],
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return questions.filter((item) => {
      if (tab === "unread" && item.isRead) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.text.toLowerCase().includes(q) ||
        (item.email ?? "").toLowerCase().includes(q) ||
        (item.chapter ?? "").toLowerCase().includes(q)
      );
    });
  }, [questions, query, tab]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto h-4 w-4 text-ink-faint" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في الأسئلة أو الأسماء…"
            className="ps-9"
          />
        </div>
        <Tabs
          value={tab}
          onValueChange={(value) => {
            setTab(value as typeof tab);
            setNotice(null);
          }}
        >
          <TabsList>
            <TabsTrigger value="unread">
              غير مقروءة
              {unreadCount > 0 && (
                <span className="ms-1 opacity-70">({unreadCount})</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="all">الكل</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {notice && (
        <p
          role="status"
          className="rounded-lg border border-emerald-300/50 bg-emerald-500/5 px-3 py-2 font-kufi text-xs text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-400/5 dark:text-emerald-400"
        >
          {notice}
        </p>
      )}
      {loadError && (
        <p
          role="alert"
          className="rounded-lg border border-rose-300/50 bg-rose-500/5 px-3 py-2 font-kufi text-xs text-rose-600 dark:border-rose-400/30 dark:bg-rose-400/5 dark:text-rose-400"
        >
          {loadError}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-line py-12">
          <Loader2 className="h-5 w-5 animate-spin text-ink-faint" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-line py-12 text-center">
          <HelpCircle className="h-6 w-6 text-ink-faint" />
          <p className="font-kufi text-sm text-ink-faint">
            {tab === "unread" ? "لا توجد أسئلة غير مقروءة" : "لا توجد أسئلة"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-card">
          {filtered.map((question, index) => (
            <article
              key={question.id}
              className={`flex flex-col gap-3 p-4 ${
                index > 0 ? "border-t border-line-soft" : ""
              }`}
            >
              <div className="flex flex-wrap items-start gap-2">
                <div className="flex flex-1 flex-col">
                  <div className="flex items-center gap-2">
                    {!question.isRead && (
                      <Badge variant="warning">جديد</Badge>
                    )}
                    <span className="ms-auto font-kufi text-xs text-ink-faint">
                      {formatRelativeTime(question.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 font-kufi text-sm font-semibold text-ink">
                    {question.name}
                  </p>
                  {question.chapter && (
                    <p className="mt-1 font-kufi text-xs text-ink-faint">
                      الفصل: {question.chapter}
                    </p>
                  )}
                  <p className="mt-2 whitespace-pre-wrap break-words font-naskh text-sm leading-relaxed text-ink-soft">
                    {question.text}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleRead(question)}
                  disabled={busyId === question.id}
                >
                  {question.isRead ? (
                    <Mail className="h-3.5 w-3.5" />
                  ) : (
                    <MailOpen className="h-3.5 w-3.5" />
                  )}
                  {question.isRead ? "غير مقروء" : "تمييز كمقروء"}
                </Button>
                {question.email && (
                  <a
                    href={`mailto:${question.email}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-card px-3 py-1.5 font-kufi text-xs text-ink transition-colors hover:bg-paper-deep"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {question.email}
                  </a>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600 dark:text-rose-400"
                  onClick={() => handleDelete(question.id)}
                  disabled={busyId === question.id}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  حذف
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
