import type { FoodGroup, GroceryItem } from "../types";
import { normalize } from "./ingredients";

export const FOOD_GROUPS: FoodGroup[] = [
  "Protein",
  "Vegetables",
  "Fruit",
  "Dairy & eggs",
  "Grains & starches",
  "Other",
];

// Order is the tie-break: "peanut butter" must hit Other before Dairy sees
// "butter", and "egg noodle" must hit Grains before Dairy & eggs sees "egg".
const RULES: { group: FoodGroup; words: string[] }[] = [
  {
    group: "Other",
    words: ["peanut butter", "almond butter", "coconut milk", "broth", "stock", "sauce", "oil", "juice", "jam"],
  },
  {
    group: "Grains & starches",
    words: ["pasta", "noodle", "rice", "bread", "tortilla", "flour", "oat", "quinoa", "couscous", "potato",
      "bagel", "cereal", "cracker", "barley", "polenta", "spaghetti", "penne", "bun", "roll"],
  },
  {
    group: "Protein",
    words: ["chicken", "beef", "pork", "turkey", "lamb", "sausage", "bacon", "ham", "steak", "fish", "salmon",
      "tuna", "shrimp", "cod", "tofu", "tempeh", "bean", "chickpea", "lentil", "meatball"],
  },
  {
    group: "Dairy & eggs",
    words: ["egg", "milk", "cheese", "butter", "yogurt", "cream", "parmesan", "mozzarella", "cheddar", "feta",
      "ricotta", "kefir"],
  },
  {
    group: "Fruit",
    words: ["apple", "banana", "orange", "lemon", "lime", "berry", "strawberry", "blueberry", "grape", "mango",
      "peach", "pear", "pineapple", "melon", "watermelon", "cherry", "plum", "kiwi", "avocado", "grapefruit"],
  },
  {
    group: "Vegetables",
    words: ["spinach", "kale", "lettuce", "arugula", "carrot", "onion", "scallion", "garlic", "tomato", "pepper",
      "broccoli", "cauliflower", "zucchini", "cucumber", "celery", "cabbage", "mushroom", "eggplant", "pea",
      "corn", "asparagus", "beet", "radish", "leek", "squash", "pumpkin", "herb", "basil", "cilantro", "parsley"],
  },
];

/** Best guess at a food group from a typed grocery name; "Other" when nothing matches. */
export function guessGroup(name: string): FoodGroup {
  const padded = ` ${normalize(name)} `;
  for (const rule of RULES) {
    if (rule.words.some((w) => padded.includes(` ${w} `))) return rule.group;
  }
  return "Other";
}

/** Items saved before food groups existed carry a location and no group; guess one for them. */
export function withGroups(saved: GroceryItem[]): GroceryItem[] {
  return saved.map((g) => (g.group ? g : { ...g, group: guessGroup(g.name) }));
}
