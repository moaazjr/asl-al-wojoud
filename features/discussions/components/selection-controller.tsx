"use client";

import * as React from "react";
import { MessageSquarePlus, X, Loader2, Send } from "lucide-react";
import type { SectionDiscussionsApi, SelectionInfo } from "../use-section-discussions";
import { useAuth } from "@/features/auth/use-auth";
import { Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FloatingSelection {
  info: SelectionInfo;
  rect: DOMRect;
}

function readSelection(
  container: HTMLElement,
): FloatingSelection | null {
  const sel = window.getSelection();
  if (!sel || sel.isCollapsed || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) return null;

  const startNode: Node = range.startContainer;
  const startEl =
    startNode.nodeType === Node.ELEMENT_NODE
      ? (startNode as Element)
      : startNode.parentElement;
  const blockEl = startEl?.closest("[data-block-index]") ?? null;
  if (!blockEl) return null;
  const idxAttr = blockEl.getAttribute("data-block-index");
  if (idxAttr === null || idxAttr === "-1") return null;

  const selectedText = sel.toString();
  if (selectedText.trim().length < 2) return null;

  const blockText = blockEl.textContent ?? "";
  const charStart = blockText.indexOf(selectedText);
  if (charStart === -1) return null;

  return {
    info: {
      blockIndex: Number(idxAttr),
      selectedText,
      charStart,
      charEnd: charStart + selectedText.length,
    },
    rect: range.getBoundingClientRect(),
  };
}

export function SelectionController({
  containerRef,
  api,
}: {
  containerRef: React.RefObject<HTMLElement | null>;
  api: SectionDiscussionsApi;
}) {
  const { requireAuth } = useAuth();
  const [floating, setFloating] = React.useState<FloatingSelection | null>(
    null,
  );
  const [mode, setMode] = React.useState<"menu" | "comment">("menu");
  const [text, setText] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const floatingRef = React.useRef<HTMLDivElement>(null);

  const handleSelectionChange = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const result = readSelection(container);
    if (result) {
      setFloating(result);
      setMode("menu");
      setText("");
      setError(null);
    }
  }, [containerRef]);

  React.useEffect(() => {
    let timer: number | undefined;
    const debounced = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(handleSelectionChange, 180);
    };
    document.addEventListener("mouseup", debounced);
    const onScroll = () => setFloating(null);
    window.addEventListener("scroll", onScroll, true);
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!floatingRef.current) return;
      if (target && floatingRef.current.contains(target)) return;
      setFloating(null);
      setMode("menu");
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("mouseup", debounced);
      window.removeEventListener("scroll", onScroll, true);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [handleSelectionChange]);

  const dismiss = React.useCallback(() => {
    setFloating(null);
    setMode("menu");
    setText("");
    setError(null);
    const sel = window.getSelection();
    sel?.removeAllRanges();
  }, []);

  function startComment() {
    if (!floating) return;
    if (!requireAuth()) return;
    setMode("comment");
  }

  async function submitComment() {
    if (!floating) return;
    if (!text.trim()) {
      setError("اكتب تعليقك أولًا");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.createDiscussion(floating.info, text.trim());
      dismiss();
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر النشر");
    } finally {
      setBusy(false);
    }
  }

  if (!floating) return null;

  const left = floating.rect.left + floating.rect.width / 2;
  const top = floating.rect.top;

  return (
    <div
      ref={floatingRef}
      className="fixed z-50 -translate-x-1/2 -translate-y-full"
      style={{ left, top: top - 10 }}
      role="dialog"
      aria-label="إجراءات التحديد"
    >
      {mode === "menu" ? (
        <div className="flex items-center gap-1 rounded-xl border border-line bg-card p-1 shadow-lift">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              startComment();
            }}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-kufi text-xs font-medium text-paper transition-colors bg-accent hover:bg-accent-bright"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            تعليق
          </button>
        </div>
      ) : (
        <div className="w-80 rounded-xl border border-line bg-card p-3 shadow-lift">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-kufi text-xs font-semibold text-ink-soft">
              تعليق جديد
            </span>
            <button
              type="button"
              onClick={dismiss}
              className="text-ink-faint hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <blockquote className="mb-2 border-s-2 border-accent/40 ps-2 font-naskh text-xs leading-relaxed text-ink-soft">
            {floating.info.selectedText.slice(0, 120)}
            {floating.info.selectedText.length > 120 ? "…" : ""}
          </blockquote>
          <Textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="اكتب تعليقك…"
            maxLength={1000}
            rows={3}
            className="text-sm"
          />
          {error && (
            <p className="mt-1.5 font-kufi text-xs text-rose-600 dark:text-rose-400">
              {error}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between">
            <span className="font-kufi text-[0.65rem] text-ink-faint">
              {text.length} / 1000
            </span>
            <Button size="sm" disabled={busy} onClick={submitComment}>
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              نشر
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
