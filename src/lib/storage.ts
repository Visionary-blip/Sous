import { createContext, useContext, useEffect, useState } from "react";

const PREFIX = "sous:";

/** Which profile's data a component reads and writes; "" is the first profile (and the profile list itself). */
export const ProfileScopeContext = createContext("");

/** Deletes everything a removed profile saved. */
export function forgetScope(scope: string): void {
  if (!scope) return;
  try {
    Object.keys(localStorage).filter((k) => k.startsWith(PREFIX + scope)).forEach((k) => localStorage.removeItem(k));
  } catch {
    // Storage unavailable: nothing to clear.
  }
}

function read<T>(key: string, fallback: () => T, migrate?: (saved: T) => T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw !== null) {
      const saved = JSON.parse(raw) as T;
      return migrate ? migrate(saved) : saved;
    }
  } catch {
    // Storage unavailable or corrupt: fall back to defaults.
  }
  return fallback();
}

/** useState that persists to localStorage, so the kitchen survives reloads. */
export function usePersistentState<T>(key: string, fallback: () => T, migrate?: (saved: T) => T) {
  const scoped = useContext(ProfileScopeContext) + key;
  const [value, setValue] = useState<T>(() => read(scoped, fallback, migrate));
  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + scoped, JSON.stringify(value));
    } catch {
      // Ignore quota / private-mode errors; state still works for this session.
    }
  }, [scoped, value]);
  return [value, setValue] as const;
}

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
}

export function todayIso(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}
