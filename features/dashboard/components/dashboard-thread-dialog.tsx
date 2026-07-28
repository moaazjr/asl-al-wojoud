"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Discussion } from "@/interfaces/types";
import { DiscussionThread } from "@/features/discussions/components/discussion-thread";
import { useDiscussionActions } from "@/features/discussions/use-discussion-actions";

export function DashboardThreadDialog({
  discussion,
  open,
  onOpenChange,
  onChanged,
}: {
  discussion: Discussion | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onChanged: () => void;
}) {
  const actions = useDiscussionActions(onChanged);

  if (!discussion) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0">
        <DialogHeader className="border-b border-line">
          <DialogTitle className="font-kufi text-base">
            {discussion.sectionTitle}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh] p-4">
          <DiscussionThread
            discussion={discussion}
            role={actions.user?.role ?? null}
            currentUserId={actions.user?.id ?? null}
            api={actions}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
