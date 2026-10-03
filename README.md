# Sous

Sous tracks what's in your kitchen and suggests what to cook from it.

- **Fridge**: log groceries, grouped by food group (Protein, Vegetables, Fruit, Dairy & eggs, Grains & starches, Other), with an optional quantity and use-by date. Sous guesses the group from the name; you can change it. You can add several at once by separating them with commas ("eggs, spinach, milk"). Items that are about to expire are flagged.
- **Cabinet**: your bank of spices, herbs, seasonings, sauces, oils and dry goods. It starts with about 90 common staples. Tap one to mark it in stock, or add your own.
- **Home**: shelves of recipe covers built from your kitchen: *Use it up* (food about to expire), *Ready to cook*, *Almost there* and *From your Classics*.
- **Recipes**: 34 built-in recipes with *Browse* (search and filters), *Classics* (meals you liked, heart) and *Wishlist* (dishes to try, +). Open a recipe to see which ingredients come from your fridge, which come from your staples, and what you're missing; press ▶ to start the cooking bar.

When you tap "Complete" on a recipe, Sous subtracts the amounts it used from your Fridge (removing anything used up) and asks about any it can't work out.

All data is saved in your browser (`localStorage`). There's no account or server of ours; the gear on Home holds profiles that live on this device (each with its own fridge, cabinet, Classics and diet), not a sign-in. The one exception is the recipe reader: under a dish, Sous can fetch a recipe page and keep a shortened copy (ingredients and short steps). The reader is one function, `api/recipe.ts`: `npm run dev` / `npm run preview` serve it through `recipe-proxy.ts`, and Vercel deploys the same file as `/api/recipe`. It only reads the recipe sites listed at the top of that file.

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

## Deploying (Vercel)

1. Push to GitHub, then on vercel.com choose **Add New > Project** and import the repo. Vercel detects Vite; `vercel.json` already sets the build (`npm run build`, output `dist`).
2. Deploy. The app is served from the site root over HTTPS, which the installable app needs, and `api/recipe.ts` becomes `/api/recipe`.
3. Check it: open `https://<your-site>/api/recipe?url=https://www.bbcgoodfood.com/recipes/easy-pancakes` and expect JSON with a `recipe`.
4. To allow another recipe site, add its domain to `ALLOWED_SITES` in `api/recipe.ts`.
