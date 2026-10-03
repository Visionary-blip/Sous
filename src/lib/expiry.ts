import { daysUntil, isExpiringSoon } from "@/lib/match";
import type { GroceryItem } from "@/types";

export interface ExpiryLabel {
  text: string;
  tone: string;
}

export function expiryLabel(item: GroceryItem, today: Date): ExpiryLabel | null {
  return item.expiresOn ? expiryText(item.expiresOn, today) : null;
}

/** The wording and colour tone for a use-by date; the Fridge badges and the Add form share it. */
export function expiryText(expiresOn: string, today: Date): ExpiryLabel {
  const days = daysUntil(expiresOn, today);
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
