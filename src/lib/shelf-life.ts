import type { FoodGroup } from "@/types";

/** Typical days in the fridge, from general food-safety rules of thumb; first matching rule wins, so specific words come first. */
const RULES: { days: number; words: string[] }[] = [
  { days: 3, words: ["cooked", "leftover", "leftovers"] },
  { days: 90, words: ["frozen"] },
  { days: 365, words: ["canned", "dried", "dry"] },
  { days: 2, words: ["chicken", "beef", "pork", "turkey", "lamb", "steak", "mince", "ground", "fish", "salmon", "cod", "shrimp", "tuna"] },
  { days: 7, words: ["sausage", "bacon", "ham", "deli", "tofu"] },
  { days: 28, words: ["egg"] },
  { days: 7, words: ["milk", "cream", "buttermilk"] },
  { days: 14, words: ["yogurt", "ricotta", "mozzarella", "feta"] },
  { days: 30, words: ["butter", "cheese", "parmesan", "cheddar"] },
  { days: 5, words: ["spinach", "lettuce", "arugula", "kale", "broccoli", "mushroom", "asparagus", "berry", "strawberry", "blueberry", "raspberry", "banana", "bread"] },
  { days: 7, words: ["tomato", "cucumber", "zucchini", "pepper", "cauliflower", "herb", "basil", "cilantro", "parsley"] },
  { days: 4, words: ["avocado"] },
  { days: 21, words: ["carrot", "apple", "orange", "lemon", "lime", "cabbage", "celery"] },
  { days: 30, words: ["onion", "garlic", "potato", "squash", "pumpkin"] },
];

const GROUP_DEFAULT: Record<FoodGroup, number> = {
  Protein: 3,
  Vegetables: 7,
  Fruit: 7,
  "Dairy & eggs": 10,
  "Grains & starches": 7,
  Other: 30,
};

function hasWord(text: string, word: string): boolean {
  return new RegExp(`\\b${word}s?\\b`).test(text);
}

/** How many days a typed grocery name usually lasts; falls back to its food group's default. */
export function assumedShelfDays(name: string, group: FoodGroup): number {
  const text = name.toLowerCase().replace(/[^a-z]+/g, " ");
  const rule = RULES.find((r) => r.words.some((w) => hasWord(text, w)));
  return rule?.days ?? GROUP_DEFAULT[group];
}

/** ISO date `days` after `fromIso`, in local time so it matches the date picker. */
export function addDaysIso(fromIso: string, days: number): string {
  const [y, m, d] = fromIso.split("-").map(Number);
  const date = new Date(y, m - 1, d + days);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mm}-${dd}`;
}

export function assumedExpiry(name: string, group: FoodGroup, fromIso: string): string {
  return addDaysIso(fromIso, assumedShelfDays(name, group));
}

/** Typical freezer life in days, from general rules of thumb (not food-safety advice); first matching rule wins. */
const FROZEN_RULES: { days: number; words: string[] }[] = [
  { days: 90, words: ["cooked", "leftover", "bread", "milk", "cream", "yogurt", "ricotta", "tortilla", "pasta"] },
  { days: 120, words: ["ground", "mince", "sausage", "bacon", "ham"] },
];

const FROZEN_GROUP_DEFAULT: Record<FoodGroup, number> = {
  Protein: 180,
  Vegetables: 240,
  Fruit: 240,
  "Dairy & eggs": 90,
  "Grains & starches": 90,
  Other: 90,
};

export function assumedFrozenDays(name: string, group: FoodGroup): number {
  const text = name.toLowerCase().replace(/[^a-z]+/g, " ");
  const rule = FROZEN_RULES.find((r) => r.words.some((w) => hasWord(text, w)));
  return rule?.days ?? FROZEN_GROUP_DEFAULT[group];
}

export function assumedFrozenExpiry(name: string, group: FoodGroup, fromIso: string): string {
  return addDaysIso(fromIso, assumedFrozenDays(name, group));
}
