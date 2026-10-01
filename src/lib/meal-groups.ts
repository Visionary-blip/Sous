import { mealOf, type Meal } from "@/lib/cover";
import type { RecipeMatch } from "@/lib/match";

export type TimeOfDay = "morning" | "noon" | "night";

export const TIMES_OF_DAY: { id: TimeOfDay; label: string }[] = [
  { id: "morning", label: "Morning" },
  { id: "noon", label: "Noon" },
  { id: "night", label: "Night" },
];

/** Snacks have no group of their own, so they sit with noon; dessert sits with night (owner's choices, 2026-09-30). */
const TIME_OF: Record<Meal, TimeOfDay> = { breakfast: "morning", lunch: "noon", snack: "noon", dinner: "night", dessert: "night" };

/** Splits matches into Morning / Noon / Night, keeping their order and dropping empty groups. */
export function groupByTimeOfDay(matches: RecipeMatch[]): { id: TimeOfDay; label: string; items: RecipeMatch[] }[] {
  return TIMES_OF_DAY.map((t) => ({ ...t, items: matches.filter((m) => TIME_OF[mealOf(m.recipe)] === t.id) })).filter(
    (g) => g.items.length > 0,
  );
}
