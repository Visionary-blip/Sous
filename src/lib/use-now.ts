import { useEffect, useState } from "react";

/** The current time, refreshed every `ms` (a minute by default), so countdown wording stays right while the app is open. */
export function useNow(ms = 60_000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), ms);
    return () => window.clearInterval(timer);
  }, [ms]);
  return now;
}
