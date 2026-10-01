import type { SimpleRecipe } from "@/lib/parse-recipe";
import type { SeedRecipe } from "@/data/seed-recipes";

/** A recipe saved under a dish; `seeded` ones came with Sous, the rest were pasted in by the owner. */
export interface SavedRecipe extends SimpleRecipe {
  dishId: string;
}

/** One row under a dish: either already read (`recipe`) or only an address until it is first opened. */
export interface RecipeEntry {
  url: string;
  label: string;
  seeded: boolean;
  recipe: SavedRecipe | null;
}

export function entriesForDish(dishId: string, saved: SavedRecipe[], seeds: SeedRecipe[]): RecipeEntry[] {
  const byUrl = new Map(saved.filter((r) => r.dishId === dishId).map((r) => [r.url, r]));
  const seeded = seeds.map((s) => ({ url: s.url, label: s.label, seeded: true, recipe: byUrl.get(s.url) ?? null }));
  const own = [...byUrl.values()]
    .filter((r) => !seeds.some((s) => s.url === r.url))
    .map((r) => ({ url: r.url, label: `${r.title} · ${r.source}`, seeded: false, recipe: r }));
  return [...seeded, ...own];
}

export function saveRecipe(saved: SavedRecipe[], recipe: SavedRecipe): SavedRecipe[] {
  return [...saved.filter((r) => !(r.dishId === recipe.dishId && r.url === recipe.url)), recipe];
}

export function removeRecipe(saved: SavedRecipe[], dishId: string, url: string): SavedRecipe[] {
  return saved.filter((r) => !(r.dishId === dishId && r.url === url));
}
