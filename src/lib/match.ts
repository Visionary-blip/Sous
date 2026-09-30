import type { GroceryItem, Recipe, RecipeIngredient, Staple } from "../types";
import { ALWAYS_AVAILABLE, normalize, satisfies } from "./ingredients";

/** Days until an item expires; negative if already past. */
export function daysUntil(isoDate: string, today: Date): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const now = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((target - now) / 86_400_000);
}

/** Items expiring within this many days are prioritized in recommendations. */
export const EXPIRING_SOON_DAYS = 3;

export function isExpiringSoon(item: GroceryItem, today: Date): boolean {
  return item.expiresOn !== undefined && daysUntil(item.expiresOn, today) <= EXPIRING_SOON_DAYS;
}

export interface IngredientStatus {
  ingredient: RecipeIngredient;
  /** What satisfies it: a grocery item, a pantry staple, or nothing. */
  source: { kind: "grocery"; item: GroceryItem } | { kind: "staple"; staple: Staple } | { kind: "assumed" } | null;
}

export interface RecipeMatch {
  recipe: Recipe;
  ingredients: IngredientStatus[];
  /** Required ingredients the user doesn't have. */
  missing: RecipeIngredient[];
  requiredCount: number;
  haveCount: number;
  /** Fraction of required ingredients on hand, 0–1. */
  score: number;
  /** Groceries (not staples) this recipe would use up. */
  usesGroceries: GroceryItem[];
  /** Of those, the ones expiring soon. */
  usesExpiring: GroceryItem[];
}

export function matchRecipe(
  recipe: Recipe,
  groceries: GroceryItem[],
  staples: Staple[],
  today: Date,
): RecipeMatch {
  const stocked = staples.filter((s) => s.inStock);
  const ingredients: IngredientStatus[] = recipe.ingredients.map((ingredient) => {
    if (ALWAYS_AVAILABLE.has(normalize(ingredient.name))) {
      return { ingredient, source: { kind: "assumed" } };
    }
    // Prefer groceries, and among them the one expiring soonest, so the
    // recipe helps use up what's about to go bad.
    const groceryHits = groceries
      .filter((g) => satisfies(g.name, ingredient.name))
      .sort((a, b) => (a.expiresOn ?? "9999").localeCompare(b.expiresOn ?? "9999"));
    if (groceryHits.length) return { ingredient, source: { kind: "grocery", item: groceryHits[0] } };
    const staple = stocked.find((s) => satisfies(s.name, ingredient.name));
    if (staple) return { ingredient, source: { kind: "staple", staple } };
    return { ingredient, source: null };
  });

  const required = ingredients.filter((i) => !i.ingredient.optional);
  const missing = required.filter((i) => i.source === null).map((i) => i.ingredient);
  const haveCount = required.length - missing.length;

  const usesGroceries: GroceryItem[] = [];
  for (const i of ingredients) {
    if (i.source?.kind === "grocery" && !usesGroceries.includes(i.source.item)) {
      usesGroceries.push(i.source.item);
    }
  }

  return {
    recipe,
    ingredients,
    missing,
    requiredCount: required.length,
    haveCount,
    score: required.length ? haveCount / required.length : 1,
    usesGroceries,
    usesExpiring: usesGroceries.filter((g) => isExpiringSoon(g, today)),
  };
}

/** Fewest missing first, then most soon-to-expire items used, then best overall match. */
export function compareMatches(a: RecipeMatch, b: RecipeMatch): number {
  return (
    a.missing.length - b.missing.length ||
    b.usesExpiring.length - a.usesExpiring.length ||
    b.score - a.score ||
    b.usesGroceries.length - a.usesGroceries.length ||
    a.recipe.minutes - b.recipe.minutes
  );
}

/** Every recipe matched against the kitchen and ranked, including ones that use no groceries. */
export function matchAll(
  recipes: Recipe[],
  groceries: GroceryItem[],
  staples: Staple[],
  today: Date = new Date(),
): RecipeMatch[] {
  return recipes.map((r) => matchRecipe(r, groceries, staples, today)).sort(compareMatches);
}

/**
 * Rank recipes for the user's current kitchen.
 *
 * Recipes that use nothing from the fridge/pantry groceries are dropped (a
 * recipe made entirely from spices isn't a useful suggestion). The rest are
 * ordered by fewest missing ingredients, then by how many soon-to-expire items
 * they use, then by overall match.
 */
export function recommend(
  recipes: Recipe[],
  groceries: GroceryItem[],
  staples: Staple[],
  today: Date = new Date(),
): RecipeMatch[] {
  return matchAll(recipes, groceries, staples, today).filter((m) => m.usesGroceries.length > 0);
}
