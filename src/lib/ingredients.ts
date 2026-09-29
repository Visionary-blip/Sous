/**
 * Ingredient name normalization and matching.
 *
 * Users type grocery names freely ("Eggs", "green onions", "Low-sodium soy sauce"),
 * while recipes use short canonical names ("egg", "scallion", "soy sauce"). These
 * helpers bridge the two.
 */

/** Different names for the same ingredient, mapped to one canonical name. */
const SYNONYMS: Record<string, string> = {
  "green onion": "scallion",
  "spring onion": "scallion",
  coriander: "cilantro",
  "coriander leaf": "cilantro",
  "garbanzo bean": "chickpea",
  capsicum: "bell pepper",
  "minced beef": "ground beef",
  "beef mince": "ground beef",
  "hamburger meat": "ground beef",
  "minced pork": "ground pork",
  "pork mince": "ground pork",
  "minced turkey": "ground turkey",
  parmigiano: "parmesan",
  "parmigiano reggiano": "parmesan",
  aubergine: "eggplant",
  courgette: "zucchini",
  "rocket": "arugula",
  prawn: "shrimp",
  "corn starch": "cornstarch",
  "confectioners sugar": "powdered sugar",
  "icing sugar": "powdered sugar",
  evoo: "olive oil",
  "canola oil": "vegetable oil",
  "sunflower oil": "vegetable oil",
  "cooking oil": "vegetable oil",
  "extra virgin olive oil": "olive oil",
  "kosher salt": "salt",
  "sea salt": "salt",
  "table salt": "salt",
  pepper: "black pepper",
  "ground black pepper": "black pepper",
  "peppercorn": "black pepper",
  "chili flake": "red pepper flake",
  "crushed red pepper": "red pepper flake",
  "sriracha sauce": "sriracha",
  "tamari": "soy sauce",
  "curry paste": "thai curry paste",
  "stock": "broth",
  "chicken stock": "chicken broth",
  "vegetable stock": "vegetable broth",
  "beef stock": "beef broth",
  "heavy whipping cream": "heavy cream",
  "whipping cream": "heavy cream",
  "double cream": "heavy cream",
  "all purpose flour": "flour",
  "ap flour": "flour",
  "plain flour": "flour",
  "white rice": "rice",
  "long grain rice": "rice",
  "jasmine rice": "rice",
  "basmati rice": "rice",
  "cheddar cheese": "cheddar",
  "mozzarella cheese": "mozzarella",
  "parmesan cheese": "parmesan",
  "feta cheese": "feta",
  "tinned tomato": "canned tomato",
  "diced tomato": "canned tomato",
  "crushed tomato": "canned tomato",
  "whole milk": "milk",
  "2 milk": "milk",
  "skim milk": "milk",
  "unsalted butter": "butter",
  "salted butter": "butter",
};

/** Specific items that also satisfy a more general recipe ingredient. */
const KIND_OF: Record<string, string> = {
  spaghetti: "pasta",
  penne: "pasta",
  linguine: "pasta",
  fettuccine: "pasta",
  rigatoni: "pasta",
  fusilli: "pasta",
  farfalle: "pasta",
  macaroni: "pasta",
  "egg noodle": "pasta",
  "brown rice": "rice",
  "sticky rice": "rice",
  shallot: "onion",
  "red onion": "onion",
  "yellow onion": "onion",
  "white onion": "onion",
};

/**
 * Words that turn an ingredient into a *different product*.
 * "garlic powder" is not "garlic", "chicken broth" is not "chicken",
 * and "sweet potato" is not "potato".
 */
const PRODUCT_FORMS = new Set([
  "sweet",
  "peanut",
  "almond",
  "cashew",
  "coconut",
  "oat",
  "soy",
  "sour",
  "powder",
  "sauce",
  "paste",
  "oil",
  "flake",
  "salt",
  "juice",
  "broth",
  "vinegar",
  "extract",
  "seed",
  "zest",
  "jam",
  "syrup",
  "starch",
  "flour",
  "milk",
  "butter",
  "cream",
  "chip",
  "bouillon",
]);

/** Words that don't change what an item is. */
const FILLER = new Set([
  "fresh",
  "organic",
  "large",
  "small",
  "medium",
  "raw",
  "whole",
  "boneless",
  "skinless",
  "low",
  "sodium",
  "reduced",
  "fat",
  "free",
  "range",
  "of",
  "a",
  "the",
  "and",
  "some",
  "leftover",
  "frozen",
  "dried",
  "dry",
]);

// Words where naive "strip the s" singularization goes wrong.
const SINGULAR_EXCEPTIONS: Record<string, string> = {
  leaves: "leaf",
  tomatoes: "tomato",
  potatoes: "potato",
  molasses: "molasses",
  hummus: "hummus",
  asparagus: "asparagus",
  couscous: "couscous",
  swiss: "swiss",
  lentils: "lentil",
  chives: "chive",
  cloves: "clove",
  berries: "berry",
  cherries: "cherry",
  anchovies: "anchovy",
  noodles: "noodle",
  peas: "pea",
  oats: "oat",
  greens: "green",
};

function singularize(word: string): string {
  if (SINGULAR_EXCEPTIONS[word]) return SINGULAR_EXCEPTIONS[word];
  if (word.length <= 3) return word;
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("oes")) return word.slice(0, -2);
  if (/(ch|sh|x)es$/.test(word)) return word.slice(0, -2);
  if (word.endsWith("ss") || word.endsWith("us")) return word;
  if (word.endsWith("s")) return word.slice(0, -1);
  return word;
}

/** Lowercase, strip punctuation and filler, singularize, and apply synonyms. */
export function normalize(name: string): string {
  const words = name
    .toLowerCase()
    .replace(/[%'’]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w && !FILLER.has(w))
    .map(singularize);
  const joined = words.join(" ");
  return SYNONYMS[joined] ?? joined;
}

/**
 * Does something the user has (`owned`) satisfy what a recipe calls for (`wanted`)?
 *
 * Every word of the recipe ingredient must appear in the owned item, so
 * "chicken" is satisfied by "chicken thighs" and "soy sauce" by
 * "low-sodium soy sauce". The owned item may not add a product-form word the
 * recipe didn't ask for, so "garlic" is NOT satisfied by "garlic powder".
 */
export function satisfies(owned: string, wanted: string): boolean {
  const o = normalize(owned);
  const w = normalize(wanted);
  if (!o || !w) return false;
  if (o === w || KIND_OF[o] === w) return true;
  // A bare product word ("butter", "milk", "oil") only matches itself, so
  // "peanut butter" doesn't count as "butter".
  if (PRODUCT_FORMS.has(w)) return false;
  const ownedWords = new Set(o.split(" "));
  const wantedWords = w.split(" ");
  if (!wantedWords.every((word) => ownedWords.has(word))) return false;
  const wantedSet = new Set(wantedWords);
  for (const word of ownedWords) {
    if (!wantedSet.has(word) && PRODUCT_FORMS.has(word)) return false;
  }
  return true;
}

/** Ingredients assumed to always be available. */
export const ALWAYS_AVAILABLE = new Set(["water", "ice"]);
