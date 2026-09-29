import type { Staple, StapleCategory } from "../types";

export const STAPLE_CATEGORIES: StapleCategory[] = [
  "Spices",
  "Herbs",
  "Seasonings",
  "Sauces & Condiments",
  "Oils & Vinegars",
  "Baking & Dry Goods",
];

/**
 * The starter bank of pantry staples. Items marked `true` start out in stock
 * because nearly every kitchen has them; users adjust from there.
 */
const STARTER: Record<StapleCategory, [string, boolean][]> = {
  Spices: [
    ["Black pepper", true],
    ["Cumin", false],
    ["Paprika", true],
    ["Smoked paprika", false],
    ["Chili powder", false],
    ["Cayenne pepper", false],
    ["Red pepper flakes", true],
    ["Cinnamon", true],
    ["Nutmeg", false],
    ["Ground ginger", false],
    ["Turmeric", false],
    ["Curry powder", false],
    ["Garam masala", false],
    ["Coriander seed", false],
    ["Cloves", false],
    ["Allspice", false],
    ["Mustard seed", false],
    ["Fennel seed", false],
  ],
  Herbs: [
    ["Oregano", true],
    ["Basil", false],
    ["Thyme", false],
    ["Rosemary", false],
    ["Bay leaves", false],
    ["Dill", false],
    ["Parsley", false],
    ["Sage", false],
    ["Italian seasoning", false],
  ],
  Seasonings: [
    ["Salt", true],
    ["Garlic powder", true],
    ["Onion powder", true],
    ["Everything bagel seasoning", false],
    ["Taco seasoning", false],
    ["Cajun seasoning", false],
    ["Lemon pepper", false],
    ["Chicken bouillon", false],
    ["Sesame seeds", false],
  ],
  "Sauces & Condiments": [
    ["Soy sauce", true],
    ["Hot sauce", false],
    ["Sriracha", false],
    ["Worcestershire sauce", false],
    ["Fish sauce", false],
    ["Oyster sauce", false],
    ["Hoisin sauce", false],
    ["Thai curry paste", false],
    ["Gochujang", false],
    ["Dijon mustard", false],
    ["Yellow mustard", false],
    ["Ketchup", true],
    ["Mayonnaise", true],
    ["BBQ sauce", false],
    ["Salsa", false],
    ["Pesto", false],
    ["Marinara sauce", false],
    ["Tomato paste", false],
    ["Honey", true],
    ["Maple syrup", false],
    ["Peanut butter", false],
    ["Chicken broth", false],
    ["Vegetable broth", false],
  ],
  "Oils & Vinegars": [
    ["Olive oil", true],
    ["Vegetable oil", true],
    ["Sesame oil", false],
    ["Coconut oil", false],
    ["Butter", false],
    ["White vinegar", false],
    ["Apple cider vinegar", false],
    ["Red wine vinegar", false],
    ["Balsamic vinegar", false],
    ["Rice vinegar", false],
  ],
  "Baking & Dry Goods": [
    ["Flour", true],
    ["Sugar", true],
    ["Brown sugar", false],
    ["Powdered sugar", false],
    ["Baking soda", true],
    ["Baking powder", true],
    ["Cornstarch", false],
    ["Vanilla extract", false],
    ["Cocoa powder", false],
    ["Rice", false],
    ["Pasta", false],
    ["Spaghetti", false],
    ["Rolled oats", false],
    ["Breadcrumbs", false],
    ["Panko", false],
    ["Canned tomatoes", false],
    ["Canned black beans", false],
    ["Canned chickpeas", false],
    ["Coconut milk", false],
    ["Lentils", false],
  ],
};

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function starterStaples(): Staple[] {
  return STAPLE_CATEGORIES.flatMap((category) =>
    STARTER[category].map(([name, inStock]) => ({
      id: `staple-${slug(name)}`,
      name,
      category,
      inStock,
    })),
  );
}
