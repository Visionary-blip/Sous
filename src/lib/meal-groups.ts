import { mealOf, type Meal } from "@/lib/cover";
import type { RecipeMatch } from "@/lib/match";

export type TimeOfDay = "morning" | "noon" | "night" | "snacks" | "dessert";

export const TIMES_OF_DAY: { id: TimeOfDay; label: string }[] = [
  { id: "morning", label: "Morning" },
  { id: "noon", label: "Noon" },
  { id: "night", label: "Night" },
  { id: "snacks", label: "Snacks" },
  { id: "dessert", label: "Dessert" },
];

/** Snacks and dessert each have their own group after Night (owner, 2026-10-01; before that snacks sat with Noon and dessert with Night). */
const TIME_OF: Record<Meal, TimeOfDay> = { breakfast: "morning", lunch: "noon", snack: "snacks", dinner: "night", dessert: "dessert" };

/** Splits matches into Morning / Noon / Night / Snacks / Dessert, keeping their order and dropping empty groups. */
export function groupByTimeOfDay(matches: RecipeMatch[]): { id: TimeOfDay; label: string; items: RecipeMatch[] }[] {
  return TIMES_OF_DAY.map((t) => ({ ...t, items: matches.filter((m) => TIME_OF[mealOf(m.recipe)] === t.id) })).filter(
    (g) => g.items.length > 0,
  );
}
