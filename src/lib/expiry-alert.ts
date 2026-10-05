import { expiryText } from "@/lib/expiry";
import type { GroceryItem } from "@/types";

/** What the last system alert covered, so the same list isn't announced again the same day. */
export interface LastAlert {
  date: string;
  key: string;
}

/** Identifies a list of due items (their ids, in a fixed order). */
export function alertKey(items: GroceryItem[]): string {
  return items.map((i) => i.id).sort().join(",");
}

export function shouldNotify(last: LastAlert | null, items: GroceryItem[], todayIso: string): boolean {
  return items.length > 0 && (last?.date !== todayIso || last.key !== alertKey(items));
}

/** "3 items due within 2 days" with the first few named, for a system alert. */
export function alertSummary(items: GroceryItem[], today: Date): { title: string; body: string } {
  const title = items.length === 1 ? "1 item due within 2 days" : `${items.length} items due within 2 days`;
  const named = items.slice(0, 4).map((i) => `${i.name} (${i.expiresOn ? expiryText(i.expiresOn, today).text.toLowerCase() : ""})`);
  const more = items.length > 4 ? ` and ${items.length - 4} more` : "";
  return { title, body: named.join(", ") + more };
}
