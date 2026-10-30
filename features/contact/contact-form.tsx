"use client";

import * as React from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trackEvent } from "@/lib/gtag";

const MAX_NAME = 80;
const MAX_EMAIL = 160;
const MAX_SUBJECT = 100;
const MAX_TEXT = 3000;

export function ContactForm() {
  const fieldId = React.useId();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);

  const nameId = `${fieldId}-name`;
  const emailId = `${fieldId}-email`;
  const subjectId = `${fieldId}-subject`;
  const messageId = `${fieldId}-message`;
  const errorId = `${fieldId}-error`;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (trimmedName.length < 2) {
      setError("يرجى كتابة الاسم.");
      return;
    }
    if (!trimmedEmail) {
      setError("يرجى إدخال البريد الإلكتروني.");
      return;
    }
    if (trimmedMessage.length < 10) {
      setError("يرجى كتابة نص الرسالة.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          subject: trimmedSubject,
          message: trimmedMessage,
          website,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!res.ok) throw new Error(body.error ?? "تعذّر إرسال الرسالة.");

      trackEvent("form_submit", {
        form_name: "contact",
        form_type: "contact",
      });
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setWebsite("");
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error && err.message.trim()
          ? err.message
          : "تعذّر إرسال الرسالة. يرجى المحاولة مرة أخرى.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col items-start gap-3 rounded-xl border border-emerald-300/50 bg-emerald-500/5 p-6 dark:border-emerald-400/30 dark:bg-emerald-400/5"
      >
        <div className="flex items-start gap-2.5">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="font-kufi text-sm leading-relaxed text-emerald-700 dark:text-emerald-400">
            تم استلام رسالتك، وسنعود إليك على البريد الإلكتروني في أقرب وقت.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setSent(false)}
        >
          إرسال رسالة أخرى
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-5 rounded-xl border border-line bg-card p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={nameId}>
            الاسم <span className="text-rose-500">*</span>
          </Label>
          <Input
            id={nameId}
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={MAX_NAME}
            autoComplete="name"
            required
            aria-invalid={error != null && name.trim().length < 2}
            aria-describedby={error ? errorId : undefined}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={emailId}>
            البريد الإلكتروني <span className="text-rose-500">*</span>
          </Label>
          <Input
            id={emailId}
            name="email"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={MAX_EMAIL}
            autoComplete="email"
            placeholder="you@example.com"
            dir="ltr"
            className="text-start"
            required
            aria-invalid={error != null && !email.trim()}
            aria-describedby={error ? errorId : undefined}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={subjectId}>الموضوع (اختياري)</Label>
        <Input
          id={subjectId}
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={MAX_SUBJECT}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={messageId}>
          الرسالة <span className="text-rose-500">*</span>
        </Label>
        <Textarea
          id={messageId}
          name="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX_TEXT}
          rows={6}
          className="min-h-36 resize-y"
          required
          aria-invalid={error != null && message.trim().length < 10}
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

      <Button type="submit" disabled={busy}>
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        إرسال الرسالة
      </Button>
    </form>
  );
}
