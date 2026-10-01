import type { Recipe } from "@/types";

export type Meal = "breakfast" | "lunch" | "dinner" | "dessert" | "snack";

/** Solid cover colour per meal: breakfast green, lunch blue, snack lighter blue, dinner purple, dessert a dark bluish black (gradients dropped 2026-10-01). */
const MEAL_COLORS: Record<Meal, string> = {
  breakfast: "#4cc38a",
  lunch: "#4b8fe0",
  snack: "#8fd0ff",
  dinner: "#a78bfa",
  dessert: "#1c2647",
};

const MEAL_ORDER: Meal[] = ["breakfast", "lunch", "dinner", "dessert"];

/**
 * A recipe tagged for several meals takes the earliest in the day. Anything with no meal tag
 * (sides) counts as a snack.
 */
export function mealOf(recipe: Recipe): Meal {
  return MEAL_ORDER.find((m) => recipe.tags.includes(m)) ?? "snack";
}

/** How much black sits at the bottom edge of a cover; kept very small on purpose (owner, 2026-10-01). */
const BLACK_AT_BOTTOM = 12;

/** The cover's background: a very light fade from black at the bottom up into its solid meal colour. */
export function coverBackground(recipe: Recipe): string {
  const color = coverColor(recipe);
  return `linear-gradient(to top, color-mix(in srgb, ${color} ${100 - BLACK_AT_BOTTOM}%, black), ${color})`;
}

/** Text colour that reads on the cover: dark on the light snack blue, white on the rest. */
export function coverInk(recipe: Recipe): string {
  return mealOf(recipe) === "snack" ? "#0d1428" : "#ffffff";
}

export function coverColor(recipe: Recipe): string {
  return MEAL_COLORS[mealOf(recipe)];
}
