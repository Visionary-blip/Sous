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

/** Chips combine with AND, so each one you turn on narrows the list. */
export function filterMatches(matches: RecipeMatch[], query: string, chips: BrowseChip[]): RecipeMatch[] {
  const q = query.trim().toLowerCase();
  return matches.filter((m) => chips.every((c) => CHIP_TESTS[c](m)) && (!q || matchesQuery(m, q)));
}

/**
 * The few recipes shown on the front: food about to expire first (but only where
 * a shopping trip isn't needed), then what is ready, then the closest of the rest
 * so the shelf is never empty. `ranked` must already be in recommendation order.
 */
export function frontPicks(ranked: RecipeMatch[], count = 5): RecipeMatch[] {
  const useItUp = ranked.filter((m) => m.usesExpiring.length > 0 && m.missing.length <= ALMOST_MAX_MISSING);
  const ready = ranked.filter((m) => m.missing.length === 0);
  return [...new Set([...useItUp, ...ready, ...ranked])].slice(0, count);
}
