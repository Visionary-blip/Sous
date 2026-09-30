# Sous — project handoff

## What it is
**Sous** is a grocery-tracking and recipe-recommendation web app. You log groceries with the date bought and a use-by date. You also keep a **Cabinet** of staples (salt, olive oil…). Sous then recommends recipes from what you have, favoring dishes that use food about to expire.

It currently exists as a **single self-contained HTML file** (`sous.html`, attached). It was built as a claude.ai Artifact (the original was named "Larder", then renamed to Sous).

## Requirements (from the user, in order)
1. Track groceries: what was bought, when it was bought, and when it's expected to expire.
2. Recommend recipes based on the groceries and ingredients added.
3. **Cabinet** feature: constant staples ("salt", "olive oil") the user adds once. These are factored into recipe recommendations.
4. Name the app **"Sous"**.
5. Give it a **less tech-like feel** and **reference Spotify** in its UI and structure.
6. **Classics** feature: a section divided into **Liked meals** and a **Wishlist**.

## Current feature set
- **Groceries**: add an item name, optional amount, bought date (defaults to today), and use-by date.
  - Typing the name auto-suggests a use-by date from a built-in shelf-life table (`SHELF`). Examples: chicken 2 days, spinach 5, eggs 28, onion 30, default 7. The date stays editable.
  - Items are sorted by use-by date. Each shows "N days left" colored by urgency: ≤2 days red, ≤5 amber, otherwise green.
  - The use-by date can be edited inline. "Used up" removes an item.
- **Cabinet**: add or remove staples, with quick-add chips for about 24 common staples (`STAPLES`).
- **Recipe box**: 28 built-in recipes (`RECIPES`). Each ingredient has a match spec, and some are optional.
- **Ranking**: fewest missing required ingredients first, then the most use-soon items used (≤3 days), then the most fridge items used.
  - Home shelves: *Use it up*, *Ready to cook*, *From your Classics*, *One or two things away*, and a *recipe box* grid of everything.
- **Classics**:
  - **Liked meals**: heart any recipe.
  - **Wishlist**: tap + on a recipe. "Made it, loved it" moves a dish from Wishlist to Liked. Liking a wishlisted item also moves it.
  - "Add your own": name, comma-separated ingredients, minutes, and steps (one per line). These entries are matched against the kitchen the same way as built-in recipes.
  - Each entry shows Ready / Need N and lists what's missing.
- **Chef's picks (Claude)**: a button sends the groceries (with days left), cabinet, and liked meals to Claude. Claude returns 3 JSON recipe ideas: `{name, minutes, uses[], missing[], why, steps[]}`. These can be opened, cooked, liked, or wishlisted.
- **Now cooking bar** (Spotify "now playing"): the play button on a recipe starts it.
  - Prev and next move through the steps, and a progress bar fills as you go. The finished state prompts you to heart the dish.
  - Tapping a step on the recipe page jumps to it.
- **Example kitchen** button: loads 10 sample groceries plus staples for demoing.

## Design direction
- A dark, Spotify-like structure: a library sidebar (Liked meals, Wishlist, Groceries, Cabinet) and a main panel with a colored gradient "wash" at the top.
  - Horizontal scrolling shelves of cards, with a hover play button on each card.
  - Quick-access tiles grid on Home.
  - Album-style recipe hero: big cover, big title, play, heart and + buttons.
  - Pill filter chips.
  - Tracklist-style rows for groceries and Classics.
  - Mobile (≤760px): the sidebar becomes a bottom tab bar (Home / Kitchen / Classics). The cooking bar becomes a compact mini-player above the tab bar.
- Warm, not techy. Warm near-black base `#0d0b0a`, panels `#181412`, saffron accent `#f4a63a`.
  - Fonts: **Fraunces** (soft serif, display) and **Figtree** (body), from Google Fonts. No monospace or technical labels.
  - Friendly dates: "Today", "Yesterday", "Sat", "Sep 12".
- Recipe covers are generated gradients: a hash of the recipe name picks one of 10 food-color pairs, and the name is set in Fraunces. Liked meals use a saffron→tomato heart cover; Wishlist uses a green bookmark cover.
- Deliberately a single dark theme. There is no light mode yet.

## Code structure (inside `sous.html`)
- Vanilla JS in an IIFE with no framework. It renders by rebuilding `#main` innerHTML per view, and all clicks are handled by one delegated listener on `data-*` attributes.
- **Views**: `home`, `kitchen` (sub-tabs `groceries` / `cabinet`), `classics` (sub-tabs `liked` / `wish`), `recipe` (by key).
- **Recipe keys**: `box:<name>` (built-in), `c:<id>` (a custom or Claude recipe saved in Classics), `idea:<i>` (unsaved Claude suggestion).
- **Ingredient matching**: `norm()` lowercases, strips punctuation and singularizes words. `matcher(spec)` takes a `|`-separated list of phrases, with a `!` prefix to exclude.
  - Example: `'butter|!peanut'`, so peanut butter does not count as butter.
  - Matching is on whole words. User-entered and Claude recipes use a looser two-way containment match, `loose()`.
- **State shape**:
  ```js
  { groceries:[{id,name,qty,bought:'YYYY-MM-DD',exp:'YYYY-MM-DD'}],
    cabinet:[{id,name}],
    liked:[entry], wish:[entry], updated:<ms> }
  // entry = {id, ref:'box:Name'}  OR  {id,name,ing:[str],steps:[str],min,note,src:'you'|'claude',added}
  ```
- **Persistence (claude.ai-specific)**:
  - Saved via `window.claude.use('db')` to a private per-user doc `data/users/<userId>/larder`, with the user id from `claude.use('user')`.
  - It is mirrored to `localStorage` key `sous.v1` (it also reads the old `larder.v1`).
  - Last-writer-wins, using an `updated` timestamp.
- **Claude suggestions (claude.ai-specific)**: `window.claude.use('sample')` → `sample.json(prompt)`.

## Porting to Claude Code
`window.claude` (db, user, sample) only exists inside claude.ai Artifacts. The code already falls back to `localStorage` when it's missing. In a standalone app:
- Persistence should become a real backend or local DB (localStorage works for a single-device prototype).
- Chef's picks needs a server route that calls the Anthropic API. Don't expose the API key in the browser.
- Consider splitting into components (React/Svelte), moving `RECIPES`/`SHELF`/`STAPLES` into data files, and adding tests for `norm`/`matcher`/`evaluate`/ranking.

## Known gaps and ideas not built yet
- No end-to-end test in a browser. Only a syntax check was run.
- Shopping list: missing ingredients from a recipe, or items marked "Used up", go onto a list. This was the suggested next step.
- "Mark ingredients used" after finishing a recipe.
- Light theme; quantities or partial use; barcode or receipt entry; notifications before items expire; a bigger or external recipe source.

## Links
- Live artifact (private to the user): https://claude.ai/artifact/Hh6fAqLjaqwsH1sh4PBcnB
