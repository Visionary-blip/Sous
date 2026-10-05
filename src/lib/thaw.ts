import type { RecipeMatch } from "@/lib/match";
import type { GroceryItem } from "@/types";

/** Frozen groceries that a dish needs: required ingredients whose only source is something in the freezer. */
export function thawNeeded(match: RecipeMatch): GroceryItem[] {
  const frozen = match.ingredients
    .filter((i) => !i.ingredient.optional && i.source?.kind === "grocery" && i.source.item.frozen)
    .map((i) => (i.source?.kind === "grocery" ? i.source.item : null));
  return frozen.filter((g, n): g is GroceryItem => g !== null && frozen.indexOf(g) === n);
}

export function thawMessage(dish: string, items: GroceryItem[]): { title: string; body: string } {
  return { title: `Thaw for ${dish}`, body: `${items.map((i) => i.name).join(", ")} ${items.length === 1 ? "is" : "are"} in the freezer.` };
}
