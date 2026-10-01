/**
 * Recipe pages offered under a dish before the owner adds any. Only the address and a label are kept;
 * the page is read and shortened the first time it is opened. All opened and checked to carry a
 * structured recipe on 2026-10-01. Keys are dish ids from `recipes.ts` / `outsourced-dishes.ts`.
 */
export interface SeedRecipe {
  url: string;
  label: string;
}

export const SEED_RECIPES: Record<string, SeedRecipe[]> = {
  pancakes: [
    { url: "https://www.bbcgoodfood.com/recipes/easy-pancakes", label: "Easy pancakes · BBC Good Food" },
    { url: "https://www.bbcgoodfood.com/recipes/american-pancakes", label: "American pancakes · BBC Good Food" },
  ],
  lasagna: [
    { url: "https://www.bbcgoodfood.com/recipes/classic-lasagne-0", label: "Classic lasagne · BBC Good Food" },
    { url: "https://www.recipetineats.com/lasagna/", label: "Lasagna · RecipeTin Eats" },
  ],
  "spaghetti-carbonara": [
    { url: "https://www.bbcgoodfood.com/recipes/ultimate-spaghetti-carbonara-recipe", label: "Ultimate carbonara · BBC Good Food" },
  ],
  brownies: [
    { url: "https://www.bbcgoodfood.com/recipes/best-ever-chocolate-brownies-recipe", label: "Best-ever brownies · BBC Good Food" },
  ],
  "chicken-fajitas": [
    { url: "https://www.bbcgoodfood.com/recipes/easy-chicken-fajitas", label: "Easy chicken fajitas · BBC Good Food" },
    { url: "https://www.recipetineats.com/chicken-fajitas/", label: "Chicken fajitas · RecipeTin Eats" },
  ],
  "chicken-fried-rice": [
    { url: "https://www.recipetineats.com/chicken-fried-rice/", label: "Chicken fried rice · RecipeTin Eats" },
    { url: "https://www.budgetbytes.com/chicken-fried-rice/", label: "Chicken fried rice · Budget Bytes" },
  ],
};
