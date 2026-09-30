import type { Recipe } from "@/types";

export type Meal = "breakfast" | "lunch" | "dinner" | "snack";

/** Cover gradients per meal: breakfast green, lunch blue, snack lighter blue, dinner purple. */
const MEAL_COLORS: Record<Meal, [string, string]> = {
  breakfast: ["#4cc38a", "#0f4a33"],
  lunch: ["#4b8fe0", "#0d2547"],
  snack: ["#8fd0ff", "#3d7fb8"],
  dinner: ["#a78bfa", "#2b1f63"],
};

const MEAL_ORDER: Meal[] = ["breakfast", "lunch", "dinner"];

/**
 * A recipe tagged for several meals takes the earliest in the day. Sides and baking carry no meal
 * tag in the data, so they count as snacks.
 */
export function mealOf(recipe: Recipe): Meal {
  return MEAL_ORDER.find((m) => recipe.tags.includes(m)) ?? "snack";
}

export function coverColors(recipe: Recipe): [string, string] {
  return MEAL_COLORS[mealOf(recipe)];
}
