import type { Recipe } from "@/types";

export type Meal = "breakfast" | "lunch" | "dinner" | "dessert" | "snack";

/** Cover gradients per meal: breakfast green, lunch blue, snack lighter blue, dinner purple, dessert a dark bluish black. */
const MEAL_COLORS: Record<Meal, [string, string]> = {
  breakfast: ["#4cc38a", "#0f4a33"],
  lunch: ["#4b8fe0", "#0d2547"],
  snack: ["#8fd0ff", "#3d7fb8"],
  dinner: ["#a78bfa", "#2b1f63"],
  dessert: ["#1c2647", "#05070f"],
};

const MEAL_ORDER: Meal[] = ["breakfast", "lunch", "dinner", "dessert"];

/**
 * A recipe tagged for several meals takes the earliest in the day. Anything with no meal tag
 * (sides) counts as a snack.
 */
export function mealOf(recipe: Recipe): Meal {
  return MEAL_ORDER.find((m) => recipe.tags.includes(m)) ?? "snack";
}

export function coverColors(recipe: Recipe): [string, string] {
  return MEAL_COLORS[mealOf(recipe)];
}
