import type { RecipeMatch } from "@/lib/match";
import { ALMOST_MAX_MISSING } from "@/lib/recipe-filters";
import type { Classics } from "@/types";

export interface Shelf {
  id: string;
  title: string;
  subtitle: string;
  items: RecipeMatch[];
}

const SHELF_SIZE = 12;
/** Classics you can nearly make are worth surfacing; further off they are just noise. */
const CLASSICS_MAX_MISSING = 3;

/**
 * The rows on the Home tab. `ranked` is every recipe in recommendation order. A recipe
 * appears on only one of the three kitchen shelves (the first that fits), so rows don't repeat.
 */
export function homeShelves(ranked: RecipeMatch[], classics: Classics): Shelf[] {
  const usable = ranked.filter((m) => m.usesGroceries.length > 0);
  // No cap on missing items here: anything that cooks with food about to expire is worth showing.
  const useItUp = usable.filter((m) => m.usesExpiring.length > 0);
  const rest = usable.filter((m) => !useItUp.includes(m));
  const ready = rest.filter((m) => m.missing.length === 0);
  const almost = rest.filter((m) => m.missing.length > 0 && m.missing.length <= ALMOST_MAX_MISSING);
  const saved = [...classics.liked, ...classics.wish].flatMap((id) => ranked.find((m) => m.recipe.id === id) ?? []);

  const shelves: Shelf[] = [
    { id: "use-it-up", title: "Use it up", subtitle: "Recipes that cook with food about to expire", items: useItUp },
    { id: "ready", title: "Ready to cook", subtitle: "Everything's already in your kitchen", items: ready },
    { id: "almost", title: "Almost there", subtitle: "Just one or two things to pick up", items: almost },
    { id: "classics", title: "From your Classics", subtitle: "Meals you love or want to try", items: saved.filter((m) => m.missing.length <= CLASSICS_MAX_MISSING) },
  ];
  return shelves.map((s) => ({ ...s, items: s.items.slice(0, SHELF_SIZE) })).filter((s) => s.items.length > 0);
}
