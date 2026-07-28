"use client";

import * as React from "react";
import type {
  DashboardStats,
  Discussion,
  DiscussionFilter,
} from "@/interfaces/types";
import { getCommentService, getUserRepository } from "@/services/container";
import { useAuth } from "@/features/auth/use-auth";

export function useDashboard() {
  const { user } = useAuth();
  const [discussions, setDiscussions] = React.useState<Discussion[]>([]);
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const reload = React.useCallback(() => {
    const svc = getCommentService();
    Promise.all([svc.listAll(), getUserRepository().count()])
      .then(([all, userCount]) => {
        setDiscussions(all);
        return svc.getStats(userCount);
      })
      .then(setStats)
      .catch(() => void 0)
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    if (user) reload();
  }, [user, reload]);

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("aa:")) reload();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [reload]);

  const toggleSelected = React.useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const resolveMany = React.useCallback(
    async (ids: string[]) => {
      if (!user) return;
      await getCommentService().resolveMany(ids, user);
      reload();
    },
    [user, reload],
  );

  const reopen = React.useCallback(
    async (id: string) => {
      if (!user) return;
      await getCommentService().reopen(id, user);
      reload();
    },
    [user, reload],
  );

  const deleteMany = React.useCallback(
    async (ids: string[]) => {
      if (!user) return;
      await getCommentService().deleteMany(ids, user);
      setSelected(new Set());
      reload();
    },
    [user, reload],
  );

  const filtered = React.useCallback(
    (filter?: DiscussionFilter) => getCommentService().listAll(filter),
    [],
  );

  return {
    user,
    discussions,
    stats,
    loading,
    reload,
    selected,
    setSelected,
    toggleSelected,
    resolveMany,
    reopen,
    deleteMany,
    filtered,
  };
}
