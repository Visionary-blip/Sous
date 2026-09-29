# Sous

Sous tracks what's in your kitchen and suggests what to cook from it.

- **Kitchen**: log groceries in the fridge, freezer or on the pantry shelf, with an optional quantity and use-by date. You can add several at once by separating them with commas ("eggs, spinach, milk"). Items that are about to expire are flagged.
- **Staples**: your bank of spices, herbs, seasonings, sauces, oils and dry goods. It starts with about 90 common staples. Tap one to mark it in stock, or add your own.
- **Recipes**: 34 built-in recipes, ranked by how many of their ingredients you already have. Recipes that use food about to expire come first. Open a recipe to see which ingredients come from your fridge, which come from your staples, and what you're missing.
- **List**: send a recipe's missing ingredients to a shopping list. When you've bought them, "Put away" restocks your staples and adds everything else to the fridge.

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
