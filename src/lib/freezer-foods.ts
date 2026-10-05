import type { Recipe } from "@/types";

/** Foods people typically keep in a freezer: meat, seafood and a few doughs. Matched on whole words in the ingredient name. */
const FREEZER_WORDS = [
  "chicken", "beef", "pork", "turkey", "lamb", "steak", "ground", "mince", "sausage", "bacon", "ham", "wings", "meatball",
  "fish", "salmon", "cod", "tuna", "shrimp", "prawn", "scallop", "crab", "lobster",
  "bread", "dumpling wrapper", "spring roll wrapper", "pizza dough", "pie crust",
];

export function typicallyFrozen(name: string): boolean {
  const text = name.toLowerCase().replace(/[^a-z]+/g, " ");
  return FREEZER_WORDS.some((w) => new RegExp(`\\b${w}s?\\b`).test(text));
}

/** True when a required ingredient is something people typically freeze; only such dishes get the pot button. */
export function needsFreezerItems(recipe: Recipe): boolean {
  return recipe.ingredients.some((i) => !i.optional && typicallyFrozen(i.name));
}
