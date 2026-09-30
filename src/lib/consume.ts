import type { RecipeMatch } from "@/lib/match";
import { subtract } from "@/lib/quantity";
import type { GroceryItem } from "@/types";

export interface Consumption {
  /** Items whose amounts could be subtracted; `left` null means nothing is left, so the item goes. */
  changes: { item: GroceryItem; used: string; left: string | null }[];
  /** Items Sous could not subtract from: the person decides. */
  unresolved: { item: GroceryItem; needed: string | undefined }[];
}

function describe(item: GroceryItem, amount: string): string {
  return `${amount.split(",")[0].trim()} ${item.name.toLowerCase()}`;
}

/** Works out what completing a recipe takes out of the pantry, without changing anything. */
export function consume(match: RecipeMatch): Consumption {
  const current = new Map<string, string | null | undefined>();
  const changes = new Map<string, { item: GroceryItem; used: string[]; left: string | null }>();
  const unresolved = new Map<string, { item: GroceryItem; needed: string | undefined }>();

  for (const { ingredient, source } of match.ingredients) {
    if (source?.kind !== "grocery") continue;
    const item = source.item;
    const have = current.has(item.id) ? current.get(item.id) : item.quantity;
    if (have === null || unresolved.has(item.id)) continue;
    const result = ingredient.amount ? subtract(have, ingredient.amount) : null;
    if (!result || !ingredient.amount) {
      unresolved.set(item.id, { item, needed: ingredient.amount });
      continue;
    }
    const left = result.kind === "gone" ? null : result.quantity;
    current.set(item.id, left);
    const entry = changes.get(item.id) ?? { item, used: [], left };
    changes.set(item.id, { ...entry, used: [...entry.used, describe(item, ingredient.amount)], left });
  }

  return {
    changes: [...changes.values()].map((c) => ({ item: c.item, used: c.used.join(", "), left: c.left })),
    unresolved: [...unresolved.values()],
  };
}

/** Applies `consume`'s changes: new quantities written back, used-up items dropped. */
export function applyChanges(groceries: GroceryItem[], changes: Consumption["changes"]): GroceryItem[] {
  const byId = new Map(changes.map((c) => [c.item.id, c.left]));
  return groceries.flatMap((g) => {
    if (!byId.has(g.id)) return [g];
    const left = byId.get(g.id);
    return left === null ? [] : [{ ...g, quantity: left }];
  });
}
