# Sous

Sous tracks what's in your kitchen and suggests what to cook from it.

- **Pantry**: log groceries, grouped by food group (Protein, Vegetables, Fruit, Dairy & eggs, Grains & starches, Other), with an optional quantity and use-by date. Sous guesses the group from the name; you can change it. You can add several at once by separating them with commas ("eggs, spinach, milk"). Items that are about to expire are flagged.
- **Cabinet**: your bank of spices, herbs, seasonings, sauces, oils and dry goods. It starts with about 90 common staples. Tap one to mark it in stock, or add your own.
- **Recipes**: 34 built-in recipes in three sections. *Recommended* shows about five picks (food about to expire first, then what you can make now) and a Browse screen with search and filters over every recipe. *Classics* holds meals you have liked (heart) and *Wishlist* holds dishes you want to try (+). Open a recipe to see which ingredients come from your fridge, which come from your staples, and what you're missing.

When you tap "I cooked this", Sous removes the groceries the recipe used.

All data is saved in your browser (`localStorage`). There's no account or server.

## Running it

Requires Node 20+.

```sh
npm install
npm run dev       # start the dev server at http://localhost:5173
npm test          # unit tests for ingredient matching and ranking
npm run build     # typecheck and build to dist/
```

## How matching works

`src/lib/ingredients.ts` normalizes names: it lowercases them, makes them singular, drops filler words like "fresh" and "boneless", and maps synonyms such as "green onion" → "scallion". An item you own satisfies a recipe ingredient when it contains all of that ingredient's words. So "chicken thighs" satisfies "chicken" and "low-sodium soy sauce" satisfies "soy sauce". An item that is a different product doesn't count: "garlic powder" is not "garlic", and "peanut butter" is not "butter".

`src/lib/match.ts` scores each recipe and ranks the list by:

1. fewest missing ingredients
2. most soon-to-expire groceries used
3. highest share of ingredients on hand

To add recipes, edit `src/data/recipes.ts`. Add `?` to the end of an ingredient to mark it optional.
