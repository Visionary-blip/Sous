/**
 * Dishes whose recipes live on other sites (see `SUGGESTION_MODE`): only what Sous needs to sort and
 * label them, with no amounts and no steps. Ingredients use the same "name" / "name?" (optional) form
 * as `recipes.ts`. Minutes are typical cooking times, not from a source. Added 2026-09-30.
 */
export interface DishDef {
  id: string;
  title: string;
  minutes: number;
  servings: number;
  tags: string[];
  ingredients: string[];
}

export const OUTSOURCED_DISHES: DishDef[] = [
  { id: "paella", title: "Paella", minutes: 60, servings: 4, tags: ["dinner", "seafood"], ingredients: ["rice", "chicken", "shrimp", "onion", "garlic", "bell pepper", "chicken broth", "paprika", "olive oil", "peas?", "chorizo?", "saffron?"] },
  { id: "butter-chicken", title: "Butter Chicken", minutes: 45, servings: 4, tags: ["dinner", "chicken"], ingredients: ["chicken", "butter", "onion", "garlic", "ginger", "canned tomato", "heavy cream", "garam masala", "rice?"] },
  { id: "chicken-masala", title: "Chicken Masala", minutes: 40, servings: 4, tags: ["dinner", "chicken"], ingredients: ["chicken", "onion", "garlic", "ginger", "canned tomato", "garam masala", "turmeric", "yogurt?", "rice?"] },
  { id: "sushi-bake", title: "Sushi Bake", minutes: 35, servings: 4, tags: ["dinner", "seafood"], ingredients: ["rice", "imitation crab", "cream cheese", "mayonnaise", "sriracha", "soy sauce?", "nori?", "avocado?", "cucumber?"] },
  { id: "chicken-tacos", title: "Chicken Tacos", minutes: 25, servings: 4, tags: ["lunch", "dinner", "chicken"], ingredients: ["chicken", "tortilla", "onion", "chili powder", "cumin", "lime?", "cilantro?", "salsa?"] },
  { id: "shrimp-tacos", title: "Shrimp Tacos", minutes: 20, servings: 4, tags: ["lunch", "dinner", "seafood"], ingredients: ["shrimp", "tortilla", "chili powder", "lime", "cabbage?", "avocado?", "sour cream?"] },
  { id: "chicken-quesadillas", title: "Chicken Quesadillas", minutes: 20, servings: 2, tags: ["lunch", "dinner", "chicken"], ingredients: ["chicken", "tortilla", "cheddar", "bell pepper?", "onion?", "salsa?"] },
  { id: "steak-fajitas", title: "Steak Fajitas", minutes: 30, servings: 4, tags: ["dinner", "beef"], ingredients: ["steak", "bell pepper", "onion", "tortilla", "lime", "chili powder", "cumin", "sour cream?"] },
  { id: "general-tsos-chicken", title: "General Tso's Chicken", minutes: 40, servings: 4, tags: ["dinner", "chicken"], ingredients: ["chicken", "cornstarch", "soy sauce", "garlic", "ginger", "rice vinegar", "sugar", "vegetable oil", "rice?", "broccoli?", "red pepper flake?"] },
  { id: "fettuccine-alfredo", title: "Fettuccine Alfredo", minutes: 25, servings: 4, tags: ["dinner", "pasta", "vegetarian"], ingredients: ["pasta", "butter", "heavy cream", "garlic", "parmesan", "black pepper?"] },
  { id: "spaghetti-carbonara", title: "Spaghetti Carbonara", minutes: 25, servings: 4, tags: ["dinner", "pasta"], ingredients: ["pasta", "egg", "bacon", "parmesan", "black pepper", "garlic?"] },
  { id: "penne-alla-vodka", title: "Penne alla Vodka", minutes: 30, servings: 4, tags: ["dinner", "pasta", "vegetarian"], ingredients: ["pasta", "canned tomato", "heavy cream", "garlic", "onion", "vodka", "parmesan?", "red pepper flake?"] },
  { id: "pesto-pasta", title: "Pesto Pasta", minutes: 20, servings: 4, tags: ["dinner", "pasta", "vegetarian"], ingredients: ["pasta", "pesto", "parmesan?", "cherry tomato?"] },
  { id: "pasta-arrabbiata", title: "Pasta Arrabbiata", minutes: 25, servings: 4, tags: ["dinner", "pasta", "vegetarian"], ingredients: ["pasta", "canned tomato", "garlic", "red pepper flake", "olive oil", "parsley?"] },
  { id: "cacio-e-pepe", title: "Cacio e Pepe", minutes: 20, servings: 4, tags: ["dinner", "pasta", "vegetarian"], ingredients: ["pasta", "pecorino", "black pepper", "butter?"] },
  { id: "spaghetti-and-meatballs", title: "Spaghetti & Meatballs", minutes: 50, servings: 4, tags: ["dinner", "pasta", "beef"], ingredients: ["pasta", "ground beef", "egg", "breadcrumbs", "garlic", "canned tomato", "onion?", "parmesan?", "basil?"] },
  { id: "swedish-meatballs", title: "Swedish Meatballs", minutes: 45, servings: 4, tags: ["dinner", "beef"], ingredients: ["ground beef", "breadcrumbs", "egg", "onion", "beef broth", "heavy cream", "butter", "flour", "ground pork?"] },
  { id: "bbq-meatballs", title: "BBQ Meatballs", minutes: 35, servings: 4, tags: ["dinner", "beef"], ingredients: ["ground beef", "breadcrumbs", "egg", "bbq sauce", "onion?", "garlic powder?"] },
  { id: "sweet-and-sour-meatballs", title: "Sweet & Sour Meatballs", minutes: 40, servings: 4, tags: ["dinner", "pork"], ingredients: ["ground pork", "egg", "breadcrumbs", "pineapple", "bell pepper", "ketchup", "rice vinegar", "sugar", "soy sauce", "rice?"] },
  { id: "sushi-rolls", title: "Sushi Rolls", minutes: 45, servings: 4, tags: ["lunch", "dinner", "seafood"], ingredients: ["rice", "nori", "rice vinegar", "cucumber", "avocado", "salmon?", "soy sauce?"] },
  { id: "fish-and-chips", title: "Fish & Chips", minutes: 45, servings: 4, tags: ["dinner", "seafood"], ingredients: ["cod", "potato", "flour", "vegetable oil", "lemon?", "tartar sauce?"] },
  { id: "poutine", title: "Poutine", minutes: 45, servings: 4, tags: ["dinner", "comfort"], ingredients: ["potato", "cheese curd", "beef broth", "butter", "flour", "vegetable oil"] },
  { id: "margherita-pizza", title: "Margherita Pizza", minutes: 30, servings: 2, tags: ["dinner", "vegetarian"], ingredients: ["pizza dough", "canned tomato", "mozzarella", "basil", "olive oil"] },
  { id: "lasagna", title: "Lasagna", minutes: 90, servings: 6, tags: ["dinner", "pasta", "beef"], ingredients: ["lasagna noodle", "ground beef", "canned tomato", "ricotta", "mozzarella", "parmesan", "onion", "garlic", "egg?"] },
  { id: "thai-green-curry", title: "Thai Green Curry", minutes: 30, servings: 4, tags: ["dinner", "chicken"], ingredients: ["thai curry paste", "coconut milk", "chicken", "fish sauce", "bell pepper?", "basil?", "rice?"] },
  { id: "japanese-curry", title: "Japanese Curry", minutes: 40, servings: 4, tags: ["dinner", "chicken"], ingredients: ["curry roux", "potato", "carrot", "onion", "chicken", "rice?"] },
];
