"use client";

import * as React from "react";
import { SearchDialog } from "./search-dialog";

interface SearchContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const SearchContext = React.createContext<SearchContextValue>({
  open: false,
  setOpen: () => {},
});

export function useSearch() {
  return React.useContext(SearchContext);
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <SearchContext.Provider value={{ open, setOpen }}>
      {children}
      <SearchDialog open={open} onOpenChange={setOpen} />
    </SearchContext.Provider>
  );
}
