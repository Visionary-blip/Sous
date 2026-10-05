import { useEffect, useMemo, useState } from "react";
import { dueSoon } from "@/lib/expiry";
import { alertKey, alertSummary, shouldNotify, type LastAlert } from "@/lib/expiry-alert";
import { currentPermission, requestPermission, showNotification, type NotifyPermission } from "@/lib/notify";
import { todayIso, usePersistentState } from "@/lib/storage";
import type { GroceryItem } from "@/types";

/**
 * Items due within 2 days, for the banner, plus a system alert (once a day per list) when allowed.
 * It re-checks whenever the app comes back to the screen, since Sous can't run while closed.
 */
export function useExpiryAlerts(groceries: GroceryItem[]) {
  const [permission, setPermission] = useState<NotifyPermission>(currentPermission);
  const [dismissed, setDismissed] = useState(false);
  const [day, setDay] = useState(todayIso);
  const [last, setLast] = usePersistentState<LastAlert | null>("expiry-alert", () => null);
  const due = useMemo(() => dueSoon(groceries, new Date()), [groceries, day]);

  useEffect(() => {
    const onShow = () => {
      if (document.visibilityState !== "visible") return;
      setDay(todayIso());
      setDismissed(false);
    };
    document.addEventListener("visibilitychange", onShow);
    return () => document.removeEventListener("visibilitychange", onShow);
  }, []);

  useEffect(() => {
    if (permission !== "granted" || !shouldNotify(last, due, day)) return;
    const { title, body } = alertSummary(due, new Date());
    void showNotification(title, body);
    setLast({ date: day, key: alertKey(due) });
  }, [permission, due, day, last, setLast]);

  return {
    due,
    permission,
    dismissed,
    dismiss: () => setDismissed(true),
    enable: async () => setPermission(await requestPermission()),
  };
}
