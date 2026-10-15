"use client";

import * as React from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitPublicComment } from "../api";

const MAX_NAME = 80;
const MAX_TEXT = 2000;

export function PublicCommentForm({
  sectionId,
  sectionTitle,
  bookTitle,
}: {
  sectionId: string;
  sectionTitle: string;
  bookTitle: string;
}) {
  const fieldId = React.useId();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [text, setText] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  const nameId = `${fieldId}-name`;
  const emailId = `${fieldId}-email`;
  const textId = `${fieldId}-text`;
  const errorId = `${fieldId}-error`;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    const trimmedName = name.trim();
    const trimmedText = text.trim();

    if (!trimmedName) {
      setError("يرجى إدخال الاسم.");
      return;
    }
    if (!trimmedText) {
      setError("يرجى كتابة التعليق.");
      return;
    }

    setBusy(true);
    try {
      await submitPublicComment({
        sectionId,
        sectionTitle,
        bookTitle,
        name: trimmedName,
        email: email.trim() || undefined,
        text: trimmedText,
        website,
      });
      setName("");
      setEmail("");
      setText("");
      setWebsite("");
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : "تعذّر إرسال التعليق. حاول مرة أخرى.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-3 rounded-2xl border border-emerald-300/50 bg-emerald-500/5 p-4 dark:border-emerald-400/30 dark:bg-emerald-400/5"
      >
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="font-kufi text-sm leading-relaxed text-emerald-700 dark:text-emerald-400">
            تم استلام تعليقك، وسيظهر بعد مراجعته والموافقة عليه.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setSent(false)}
        >
          إضافة تعليق آخر
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-3 rounded-2xl border border-line bg-paper-deep/40 p-4"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={nameId}>
            الاسم <span className="text-rose-500">*</span>
          </Label>
          <Input
            id={nameId}
            name="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_NAME}
            autoComplete="name"
            placeholder="اسمك"
            required
            aria-invalid={error != null && !name.trim()}
            aria-describedby={error ? errorId : undefined}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={emailId}>البريد الإلكتروني (اختياري)</Label>
          <Input
            id={emailId}
            name="email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            dir="ltr"
            className="text-start"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={textId}>
          التعليق <span className="text-rose-500">*</span>
        </Label>
        <Textarea
          id={textId}
          name="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_TEXT}
          rows={4}
          required
          placeholder="اكتب تعليقًا على هذا المبحث…"
          aria-invalid={error != null && !text.trim()}
          aria-describedby={error ? errorId : undefined}
        />
      </div>

      <div className="hidden" aria-hidden="true">
        <label htmlFor={`${fieldId}-website`}>Website</label>
        <input
          id={`${fieldId}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="font-kufi text-xs text-rose-600 dark:text-rose-400"
        >
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-kufi text-[0.7rem] leading-relaxed text-ink-faint">
          سيظهر تعليقك بعد مراجعة المشرف والموافقة عليه.
        </p>
        <Button type="submit" disabled={busy} className="w-full sm:w-auto">
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          إرسال التعليق
        </Button>
      </div>
    </form>
  );
}
