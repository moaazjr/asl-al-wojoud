"use client";

import * as React from "react";
import { Send, Loader2 } from "lucide-react";
import type { Discussion } from "@/interfaces/types";
import type { DiscussionActions } from "../types";
import { Avatar } from "@/components/ui/avatar";

export function DiscussionComposer({
  discussion,
  api,
}: {
  discussion: Discussion;
  api: DiscussionActions;
}) {
  const [text, setText] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const taRef = React.useRef<HTMLTextAreaElement>(null);

  const isAdmin = api.user?.role === "admin";
  const canPost = isAdmin;

  React.useEffect(() => {
    const el = taRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [text]);

  async function submit() {
    if (!text.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await api.addMessage(discussion.id, text.trim());
      setText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر النشر");
    } finally {
      setBusy(false);
    }
  }

  if (!api.user) {
    return (
      <p className="py-1.5 text-center font-kufi text-xs text-ink-faint">
        سجّل الدخول للمشاركة في النقاش
      </p>
    );
  }

  if (!canPost) return null;

  const placeholder = isAdmin ? "اكتب ردّك كمشرف…" : "اكتب تعليقك…";

  return (
    <div className="flex items-start gap-2.5 pt-1">
      <Avatar
        name={api.user.name}
        isAdmin={isAdmin}
        className="h-9 w-9 shrink-0 text-sm"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-end gap-2 rounded-2xl border border-line-soft bg-paper-deep/50 px-3.5 py-2 transition-colors focus-within:border-accent/40">
          <textarea
            ref={taRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={placeholder}
            rows={1}
            maxLength={1000}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
            className="max-h-32 w-full resize-none bg-transparent font-naskh text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint"
          />
          {text.trim() && (
            <button
              type="button"
              disabled={busy}
              onClick={submit}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-accent px-3 py-1.5 font-kufi text-xs font-bold text-paper transition-colors hover:bg-accent/90 disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {isAdmin ? "ردّ" : "نشر"}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 ps-1 font-kufi text-xs text-rose-600 dark:text-rose-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
