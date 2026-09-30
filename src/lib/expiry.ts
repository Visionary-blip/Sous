import { daysUntil, isExpiringSoon } from "@/lib/match";
import type { GroceryItem } from "@/types";

export function expiryLabel(item: GroceryItem, today: Date): { text: string; tone: string } | null {
  if (!item.expiresOn) return null;
  const days = daysUntil(item.expiresOn, today);
  if (days < 0) return { text: `Expired ${-days}d ago`, tone: "danger" };
  if (days === 0) return { text: "Use today", tone: "danger" };
  if (days === 1) return { text: "Use by tomorrow", tone: "warn" };
  if (days <= 3) return { text: `Use within ${days} days`, tone: "warn" };
  return { text: `Good for ${days} days`, tone: "ok" };
}

/** Groceries that need using soon (already-expired ones included), most urgent first. */
export function expiringSoon(groceries: GroceryItem[], today: Date): GroceryItem[] {
  return groceries
    .filter((g) => isExpiringSoon(g, today))
    .sort((a, b) => (a.expiresOn ?? "").localeCompare(b.expiresOn ?? ""));
}
