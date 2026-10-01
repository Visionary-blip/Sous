import { CUISINE_OF, type Cuisine } from "@/data/cuisines";
import type { RecipeMatch } from "@/lib/match";

export type BrowseChip = "ready" | "use-up" | "quick" | "almost";

export const BROWSE_CHIPS: { id: BrowseChip; label: string }[] = [
  { id: "ready", label: "Ready now" },
  { id: "use-up", label: "Use it up" },
  { id: "quick", label: "Under 20 min" },
  { id: "almost", label: "Almost there" },
];

/** "Almost there" means one or two ingredients short. */
export const ALMOST_MAX_MISSING = 2;

const CHIP_TESTS: Record<BrowseChip, (m: RecipeMatch) => boolean> = {
  ready: (m) => m.missing.length === 0,
  "use-up": (m) => m.usesExpiring.length > 0,
  quick: (m) => m.recipe.minutes < 20,
  almost: (m) => m.missing.length > 0 && m.missing.length <= ALMOST_MAX_MISSING,
};

function matchesQuery(m: RecipeMatch, query: string): boolean {
  const hay = [m.recipe.title, ...m.recipe.tags, ...m.recipe.ingredients.map((i) => i.name)];
  return hay.join(" ").toLowerCase().includes(query);
}

/** With no cuisine on, everything passes; with several on, a recipe needs to be any one of them. */
function matchesCuisine(m: RecipeMatch, cuisines: Cuisine[]): boolean {
  if (cuisines.length === 0) return true;
  const cuisine = CUISINE_OF[m.recipe.id];
  return cuisine !== undefined && cuisines.includes(cuisine);
}

/** The filter chips combine with AND, so each one you turn on narrows the list; cuisines combine with OR. */
export function filterMatches(matches: RecipeMatch[], query: string, chips: BrowseChip[], cuisines: Cuisine[] = []): RecipeMatch[] {
  const q = query.trim().toLowerCase();
  return matches.filter((m) => chips.every((c) => CHIP_TESTS[c](m)) && matchesCuisine(m, cuisines) && (!q || matchesQuery(m, q)));
}

/** A to Z by title, ignoring case. Sorts a copy. */
export function sortByTitle(matches: RecipeMatch[]): RecipeMatch[] {
  return [...matches].sort((a, b) => a.recipe.title.localeCompare(b.recipe.title, undefined, { sensitivity: "base" }));
}

/** A dish counts as "from your fridge" when at least this many of its ingredients are groceries you have. */
export const FRIDGE_MIN_INGREDIENTS = 2;

/** Splits matches into those using enough of the fridge and the rest, keeping each list's order. */
export function splitByFridge(matches: RecipeMatch[]): { fromFridge: RecipeMatch[]; others: RecipeMatch[] } {
  const fromFridge = matches.filter((m) => m.usesGroceries.length >= FRIDGE_MIN_INGREDIENTS);
  return { fromFridge, others: matches.filter((m) => !fromFridge.includes(m)) };
}
