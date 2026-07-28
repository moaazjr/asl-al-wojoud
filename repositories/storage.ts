export const STORAGE_KEYS = {
  users: "aa:users",
  session: "aa:session",
  discussions: "aa:discussions",
  notifications: "aa:notifications",
} as const;

const SESSION_KEY = "aa:session";

export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    void 0;
  }
}

export function readSessionJSON<T>(fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeSessionJSON<T>(value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
  } catch {
    void 0;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    void 0;
  }
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function hashPassword(password: string): string {
  if (typeof window === "undefined") return password;
  try {
    return btoa(unescape(encodeURIComponent(`aa::${password}`)));
  } catch {
    return password;
  }
}
