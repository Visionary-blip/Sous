import type { Recipe } from "@/types";

export type DietId = "vegetarian" | "vegan" | "pescatarian" | "gluten-free" | "dairy-free" | "nut-free" | "keto" | "paleo" | "halal-kosher";

interface DietRule {
  label: string;
  /** Plain-words note shown in settings, where a rule is narrower than the name suggests. */
  note?: string;
  /** Whole words (plural allowed) that make an ingredient break the diet. */
  avoid: string[];
  /** Phrases that contain an avoided word but are fine ("coconut milk" is not dairy); removed before testing. */
  except?: string[];
}

const MEAT = ["chicken", "beef", "pork", "bacon", "ham", "sausage", "chorizo", "steak", "lamb", "turkey", "veal", "pepperoni", "salami", "ground beef", "ground pork", "ground lamb"];
const FISH = ["shrimp", "salmon", "cod", "tuna", "anchovy", "crab", "imitation crab", "lobster", "fish sauce", "fish", "worcestershire sauce"];
const DAIRY = ["milk", "butter", "buttermilk", "cheese", "cheddar", "mozzarella", "parmesan", "pecorino", "ricotta", "mascarpone", "feta", "gruyere", "cotija", "paneer", "cheese curd", "cream", "heavy cream", "sour cream", "yogurt", "ghee", "pesto"];
const EGGS_AND_HIVE = ["egg", "mayonnaise", "honey", "ladyfinger"];
const GLUTEN = ["flour", "bread", "breadcrumbs", "panko", "bun", "burger bun", "pasta", "noodle", "dumpling wrapper", "spring roll wrapper", "baguette", "tortilla", "pizza dough", "pie crust", "ladyfinger", "soy sauce", "couscous", "beer"];
const GRAINS = [...GLUTEN, "rice", "arborio rice", "rolled oats", "oats", "cornmeal", "grits", "hominy", "corn", "cornstarch"];
const LEGUMES = ["beans", "black beans", "baked beans", "chickpea", "lentil", "peanut", "tofu", "pea", "soy sauce"];
const SUGARS = ["sugar", "brown sugar", "powdered sugar", "honey", "maple syrup"];
const NUTS = ["peanut", "peanut butter", "almond", "walnut", "pecan", "cashew", "pistachio", "hazelnut", "pine nut", "pesto"];

const DAIRY_EXCEPT = ["coconut milk", "peanut butter", "cream of tartar", "coconut cream"];
const GRAIN_EXCEPT = ["rice vinegar", "tapioca flour", "rice flour"];

export const DIET_RULES: Record<DietId, DietRule> = {
  vegetarian: { label: "Vegetarian", avoid: [...MEAT, ...FISH, "chicken broth", "beef broth"] },
  vegan: { label: "Vegan", avoid: [...MEAT, ...FISH, ...DAIRY, ...EGGS_AND_HIVE], except: DAIRY_EXCEPT },
  pescatarian: { label: "Pescatarian", avoid: [...MEAT, "chicken broth", "beef broth"] },
  "gluten-free": { label: "Gluten free", avoid: GLUTEN, except: GRAIN_EXCEPT },
  "dairy-free": { label: "Dairy free", avoid: DAIRY, except: DAIRY_EXCEPT },
  "nut-free": { label: "Nut free", avoid: NUTS },
  keto: { label: "Keto", note: "Avoids grains, sugar, starchy vegetables and beans.", avoid: [...GRAINS, ...LEGUMES, ...SUGARS, "potato", "sweet potato", "banana", "apple", "pineapple", "ketchup", "bbq sauce", "tapioca flour", "chocolate chips"], except: ["rice vinegar"] },
  paleo: { label: "Paleo", note: "Avoids grains, beans, dairy and refined sugar.", avoid: [...GRAINS, ...LEGUMES, ...DAIRY, "sugar", "brown sugar", "powdered sugar", "ketchup", "bbq sauce"], except: [...DAIRY_EXCEPT, "rice vinegar"] },
  "halal-kosher": { label: "Halal / Kosher", note: "Only checks pork, shellfish and alcohol. It does not check how meat was prepared or keep meat and dairy apart.", avoid: ["pork", "bacon", "ham", "sausage", "chorizo", "pepperoni", "ground pork", "pork chop", "pork shoulder", "shrimp", "crab", "imitation crab", "lobster", "red wine", "wine", "vodka", "beer"] },
};

export const DIET_IDS = Object.keys(DIET_RULES) as DietId[];

function hits(name: string, rule: DietRule): boolean {
  const cleaned = (rule.except ?? []).reduce((n, phrase) => n.replaceAll(phrase, " "), name.toLowerCase());
  return rule.avoid.some((w) => new RegExp(`\\b${w}s?\\b`).test(cleaned));
}

/** Optional ingredients are ignored, since the cook can leave them out. */
export function fitsDiets(recipe: Recipe, diets: DietId[]): boolean {
  const needed = recipe.ingredients.filter((i) => !i.optional);
  return diets.every((d) => !needed.some((i) => hits(i.name, DIET_RULES[d])));
}

function wholeWord(word: string): RegExp {
  return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}s?\\b`);
}

/** Strict on purpose: unlike diets, an avoided food counts even when the ingredient is optional. */
export function usesAvoided(recipe: Recipe, avoid: string[]): boolean {
  const patterns = avoid.map(wholeWord);
  return recipe.ingredients.some((i) => patterns.some((p) => p.test(i.name.toLowerCase())));
}
