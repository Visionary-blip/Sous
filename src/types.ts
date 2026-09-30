export type Location = "fridge" | "freezer" | "pantry";

/** A perishable or stocked grocery item the user has on hand. */
export interface GroceryItem {
  id: string;
  name: string;
  location: Location;
  quantity?: string;
  /** ISO date (YYYY-MM-DD) the item should be used by. */
  expiresOn?: string;
  addedOn: string;
}

export type StapleCategory =
  | "Spices"
  | "Herbs"
  | "Seasonings"
  | "Sauces & Condiments"
  | "Oils & Vinegars"
  | "Baking & Dry Goods";

/** A long-lasting staple (spice, sauce, oil...) in the user's pantry bank. */
export interface Staple {
  id: string;
  name: string;
  category: StapleCategory;
  /** Whether the user currently has it stocked. */
  inStock: boolean;
}

export interface RecipeIngredient {
  name: string;
  amount?: string;
  /** Optional ingredients don't count against a recipe's match. */
  optional?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  minutes: number;
  servings: number;
  tags: string[];
  ingredients: RecipeIngredient[];
  steps: string[];
}
