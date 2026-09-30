export type Cuisine = "Asia" | "Central America" | "South America" | "American South" | "Romance" | "Northern Europe" | "American";

/** The groups behind the Ethnicity button in Browse, in display order. */
export const CUISINES: Cuisine[] = ["Asia", "Central America", "South America", "American South", "Romance", "Northern Europe", "American"];

/**
 * Which flavour group each dish belongs to (owner's groups, 2026-09-30). Asia is China, Japan, India,
 * Thailand and the rest; Romance is Italy, Spain, France and Portugal; Central America includes Mexico;
 * Poutine counts as American. Assigned by hand. A dish that fits none is left out, so it shows only when
 * no group is selected. No dish is South America yet.
 */
export const CUISINE_OF: Record<string, Cuisine> = {
  // Asia
  "chicken-stir-fry": "Asia",
  "chicken-fried-rice": "Asia",
  "beef-broccoli": "Asia",
  "peanut-sesame-noodles": "Asia",
  "chickpea-curry": "Asia",
  "butter-chicken": "Asia",
  "chicken-masala": "Asia",
  "sushi-bake": "Asia",
  "sushi-rolls": "Asia",
  "general-tsos-chicken": "Asia",
  "sweet-and-sour-meatballs": "Asia",
  "thai-green-curry": "Asia",
  "japanese-curry": "Asia",
  // Central America (Mexico included)
  "chicken-fajitas": "Central America",
  "beef-tacos": "Central America",
  "black-bean-quesadillas": "Central America",
  "chicken-tacos": "Central America",
  "shrimp-tacos": "Central America",
  "chicken-quesadillas": "Central America",
  "steak-fajitas": "Central America",
  // American South
  "bbq-meatballs": "American South",
  // Romance: Italy, Spain, France, Portugal
  "spaghetti-aglio-olio": "Romance",
  "pasta-marinara": "Romance",
  "spaghetti-bolognese": "Romance",
  "creamy-tuscan-pasta": "Romance",
  "mushroom-risotto": "Romance",
  "caprese-salad": "Romance",
  "fettuccine-alfredo": "Romance",
  "spaghetti-carbonara": "Romance",
  "penne-alla-vodka": "Romance",
  "pesto-pasta": "Romance",
  "pasta-arrabbiata": "Romance",
  "cacio-e-pepe": "Romance",
  "spaghetti-and-meatballs": "Romance",
  "margherita-pizza": "Romance",
  lasagna: "Romance",
  "garlic-shrimp": "Romance",
  paella: "Romance",
  // Northern Europe
  "swedish-meatballs": "Northern Europe",
  "fish-and-chips": "Northern Europe",
  // American (North America outside the South and Mexico)
  "garlic-butter-chicken": "American",
  "mac-and-cheese": "American",
  "smash-burgers": "American",
  pancakes: "American",
  "grilled-cheese-tomato-soup": "American",
  "chicken-caesar-wrap": "American",
  "chicken-noodle-soup": "American",
  "pork-chops-apples": "American",
  "banana-bread": "American",
  poutine: "American",
};
