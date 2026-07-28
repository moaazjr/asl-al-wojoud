"use client";

import { useCallback, useRef, useState } from "react";
import { normalizeArabic } from "@/lib/arabic";
import type { SearchDoc } from "./types";

type FlexIndex = {
  search: (query: string, limit?: number) => unknown[];
  add: (id: number, content: string) => void;
};

export function useSearchIndex() {
  const indexRef = useRef<FlexIndex | null>(null);
  const docsRef = useRef<SearchDoc[] | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const ensureLoaded = useCallback(async () => {
    if (indexRef.current) return;
    setLoading(true);
    try {
      const FlexSearch = (await import("flexsearch")).default;
      const res = await fetch("/search-docs.json");
      const docs: SearchDoc[] = await res.json();
      docsRef.current = docs;
      const index = new (FlexSearch as unknown as {
        Index: new (opts: Record<string, unknown>) => FlexIndex;
      }).Index({
        encode: (str: unknown) => {
          if (typeof str !== "string") return [];
          return normalizeArabic(str)
            .split(/\s+/)
            .filter((t) => t.length > 1);
        },
        tokenize: "forward",
        resolution: 9,
        fastUpdate: false,
        context: false,
      });
      for (const doc of docs) {
        index.add(doc.i, `${doc.t} ${doc.t} ${doc.c}`);
      }
      indexRef.current = index;
      setReady(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const search = useCallback(
    (query: string, limit = 10): SearchDoc[] => {
      if (!indexRef.current || !docsRef.current) return [];
      const norm = normalizeArabic(query).trim();
      if (!norm) return [];
      const raw = indexRef.current.search(norm, limit);
      const ids = Array.isArray(raw[0])
        ? (raw as unknown[][]).flat()
        : (raw as unknown[]);
      const out: SearchDoc[] = [];
      for (const id of ids) {
        const doc = docsRef.current[id as number];
        if (doc) out.push(doc);
      }
      return out;
    },
    [],
  );

  return { ready, loading, ensureLoaded, search };
}
