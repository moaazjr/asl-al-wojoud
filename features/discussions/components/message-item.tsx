"use client";

import * as React from "react";
import {
  Heart,
  Trash2,
  Pencil,
  Pin,
  PinOff,
  Check,
  BadgeCheck,
  X,
  Loader2,
  MoreVertical,
  CornerUpLeft,
  Send,
} from "lucide-react";
import type { Discussion, Message, Role } from "@/interfaces/types";
import type { DiscussionActions } from "../types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { canDeleteMessage, canEditMessage, permissions } from "@/services/permissions";
import { formatRelativeTime } from "@/lib/format";

export function MessageItem({
  discussion,
  message,
  role,
  currentUserId,
  api,
  replies = [],
  isReply = false,
}: {
  discussion: Discussion;
  message: Message;
  role: Role | null;
  currentUserId: string | null;
  api: DiscussionActions;
  replies?: Message[];
  isReply?: boolean;
}) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(message.text);
  const [busy, setBusy] = React.useState(false);
  const [replying, setReplying] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");
  const [replyBusy, setReplyBusy] = React.useState(false);
  const editRef = React.useRef<HTMLTextAreaElement>(null);
  const replyRef = React.useRef<HTMLTextAreaElement>(null);

  const isAdmin = message.authorRole === "admin";
  const liked = currentUserId ? message.likes.includes(currentUserId) : false;
  const canEdit =
    role != null && canEditMessage(role, message, currentUserId ?? "");
  const canDelete =
    role != null && canDeleteMessage(role, message, currentUserId ?? "");
  const canPin = role != null && permissions.canPin(role);
  const isPinned = discussion.pinnedMessageId === message.id;
  const showMenu = canEdit || canDelete || canPin;
  const canPost =
    discussion.status === "open" &&
    api.user?.role === "admin";

  const avatarSize = isReply ? "h-7 w-7 text-[0.7rem]" : "h-9 w-9 text-sm";

  React.useEffect(() => {
    const el = editRef.current;
    if (el && editing) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [draft, editing]);

  React.useEffect(() => {
    const el = replyRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [replyText]);

  async function save() {
    if (!draft.trim()) return;
    setBusy(true);
    try {
      await api.editMessage(discussion.id, message.id, draft.trim());
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  async function submitReply() {
    if (!replyText.trim()) return;
    setReplyBusy(true);
    try {
      await api.addMessage(discussion.id, replyText.trim(), message.id);
      setReplyText("");
      setReplying(false);
    } finally {
      setReplyBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-start gap-2.5">
        <Avatar
          name={message.authorName}
          isAdmin={isAdmin}
          className={`${avatarSize} shrink-0`}
        />

        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="rounded-2xl bg-paper-deep/70 px-3.5 py-2.5">
              <textarea
                ref={editRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={1}
                maxLength={1000}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void save();
                  }
                  if (e.key === "Escape") {
                    setEditing(false);
                    setDraft(message.text);
                  }
                }}
                className="max-h-40 w-full resize-none bg-transparent font-naskh text-sm leading-relaxed text-ink outline-none"
              />
              <div className="mt-2 flex items-center gap-2">
                <Button size="sm" disabled={busy} onClick={save}>
                  {busy ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  حفظ
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(false);
                    setDraft(message.text);
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                  إلغاء
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div
                className={`w-fit max-w-full rounded-2xl px-3.5 py-2.5 ${
                  isAdmin
                    ? "bg-accent-soft/50 ring-1 ring-accent/10"
                    : "bg-paper-deep/70 dark:bg-paper-deep/40"
                }`}
              >
                {isPinned && (
                  <span className="mb-1 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 font-kufi text-[0.6rem] font-bold text-paper">
                    <Pin className="h-2.5 w-2.5" />
                    مثبّت
                  </span>
                )}
                <div className="flex flex-wrap items-center gap-x-1.5">
                  <span className="font-kufi text-[0.8rem] font-bold text-ink">
                    {message.authorName}
                  </span>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-0.5">
                      <Badge variant="admin" className="px-1.5 py-0 text-[0.55rem]">
                        مشرف
                      </Badge>
                      <BadgeCheck className="h-3 w-3 text-accent" />
                    </span>
                  )}
                </div>
                <p className="mt-0.5 whitespace-pre-wrap break-words font-naskh text-sm leading-relaxed text-ink-soft">
                  {message.text}
                </p>
              </div>

              <div className="mt-0.5 flex items-center gap-2.5 px-1">
                <span className="font-kufi text-[0.7rem] text-ink-faint">
                  {formatRelativeTime(message.createdAt)}
                  {message.editedAt && " · مُعدّل"}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    currentUserId &&
                    void api.toggleLike(discussion.id, message.id)
                  }
                  className={`inline-flex items-center gap-1 font-kufi text-[0.7rem] font-semibold transition-colors ${
                    liked
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-ink-faint hover:text-ink"
                  }`}
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`}
                  />
                  إعجاب
                  {message.likes.length > 0 && (
                    <span className="font-bold">{message.likes.length}</span>
                  )}
                </button>

                {!isReply && canPost && !replying && (
                  <button
                    type="button"
                    onClick={() => setReplying(true)}
                    className="inline-flex items-center gap-1 font-kufi text-[0.7rem] font-semibold text-ink-faint transition-colors hover:text-ink"
                  >
                    <CornerUpLeft className="h-3.5 w-3.5" />
                    ردّ
                  </button>
                )}

                {showMenu && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="rounded-md p-0.5 text-ink-faint transition-colors hover:bg-paper-deep hover:text-ink">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {canEdit && (
                        <DropdownMenuItem onClick={() => setEditing(true)}>
                          <Pencil className="h-4 w-4" />
                          تعديل
                        </DropdownMenuItem>
                      )}
                      {canPin && !isPinned && (
                        <DropdownMenuItem
                          onClick={() =>
                            void api.pinMessage(discussion.id, message.id)
                          }
                        >
                          <Pin className="h-4 w-4" />
                          تثبيت
                        </DropdownMenuItem>
                      )}
                      {canPin && isPinned && (
                        <DropdownMenuItem
                          onClick={() => void api.unpin(discussion.id)}
                        >
                          <PinOff className="h-4 w-4" />
                          إزالة التثبيت
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem
                          variant="danger"
                          onClick={() => {
                            if (confirm("هل تريد حذف هذا التعليق؟"))
                              void api.deleteMessage(
                                discussion.id,
                                message.id,
                              );
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          حذف
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {!isReply && replying && api.user && (
        <div className="mt-2 ms-9 flex items-start gap-2">
          <Avatar
            name={api.user.name}
            isAdmin={api.user.role === "admin"}
            className="h-7 w-7 shrink-0 text-[0.7rem]"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-end gap-2 rounded-2xl border border-line-soft bg-paper-deep/50 px-3 py-1.5 transition-colors focus-within:border-accent/40">
              <textarea
                ref={replyRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="اكتب ردًا…"
                rows={1}
                maxLength={1000}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void submitReply();
                  }
                  if (e.key === "Escape") {
                    setReplying(false);
                    setReplyText("");
                  }
                }}
                className="max-h-24 w-full resize-none bg-transparent font-naskh text-sm leading-relaxed text-ink outline-none placeholder:text-ink-faint"
              />
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setReplying(false);
                    setReplyText("");
                  }}
                  className="rounded-lg px-2 py-1 font-kufi text-[0.7rem] text-ink-faint transition-colors hover:text-ink"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={replyBusy || !replyText.trim()}
                  onClick={submitReply}
                  className="inline-flex items-center gap-1 rounded-lg bg-accent px-2.5 py-1 font-kufi text-[0.7rem] font-bold text-paper transition-colors hover:bg-accent/90 disabled:opacity-50"
                >
                  {replyBusy ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                  ردّ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isReply && replies.length > 0 && (
        <div className="mt-2.5 ms-9 space-y-2.5 border-s-2 border-line-soft ps-3">
          {replies.map((r) => (
            <MessageItem
              key={r.id}
              discussion={discussion}
              message={r}
              role={role}
              currentUserId={currentUserId}
              api={api}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}
