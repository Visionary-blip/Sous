import { useEffect, useState } from "react";

const PREFIX = "sous:";

function read<T>(key: string, fallback: () => T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw !== null) return JSON.parse(raw) as T;
  } catch {
    // Storage unavailable or corrupt: fall back to defaults.
  }
  return fallback();
}

/** useState that persists to localStorage, so the kitchen survives reloads. */
export function usePersistentState<T>(key: string, fallback: () => T) {
  const [value, setValue] = useState<T>(() => read(key, fallback));
  useEffect(() => {
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      // Ignore quota / private-mode errors; state still works for this session.
    }
  }, [key, value]);
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
