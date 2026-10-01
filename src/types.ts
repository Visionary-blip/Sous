export type FoodGroup =
  | "Protein"
  | "Vegetables"
  | "Fruit"
  | "Dairy & eggs"
  | "Grains & starches"
  | "Other";

/** A perishable or stocked grocery item the user has on hand. */
export interface GroceryItem {
  id: string;
  name: string;
  group: FoodGroup;
  quantity?: string;
  /** ISO date (YYYY-MM-DD) the item should be used by. */
  expiresOn?: string;
  /** True when Sous guessed the use-by date from the name rather than the person entering it. */
  expiryEstimated?: boolean;
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

/** Recipe ids the user has liked (Classics) or wants to try (Wishlist). A recipe is in at most one. */
export interface Classics {
  liked: string[];
  wish: string[];
}
