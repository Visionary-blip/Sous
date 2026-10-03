/** More sites added 2026-10-01: their search pages answered 200 to a command-line request, not yet opened in a browser. Recipe sites whose own search pages take a `q` query; Allrecipes and BBC Good Food were opened in a browser on 2026-09-30; NYT Cooking's search answered 200 to a command-line request but cannot be opened in the in-app browser. */
const SITES: { label: string; search: (q: string) => string }[] = [
  { label: "BBC Good Food", search: (q) => `https://www.bbcgoodfood.com/search?q=${q}` },
  { label: "Allrecipes", search: (q) => `https://www.allrecipes.com/search?q=${q}` },
  { label: "Epicurious", search: (q) => `https://www.epicurious.com/search?q=${q}` },
  { label: "Budget Bytes", search: (q) => `https://www.budgetbytes.com/?s=${q}` },
  { label: "RecipeTin Eats", search: (q) => `https://www.recipetineats.com/?s=${q}` },
  { label: "Delish", search: (q) => `https://www.delish.com/search/?q=${q}` },
  { label: "King Arthur Baking", search: (q) => `https://www.kingarthurbaking.com/search?query=${q}` },
  { label: "NYT Cooking", search: (q) => `https://cooking.nytimes.com/search?q=${q}` },
];

export interface SuggestionLink {
  label: string;
  url: string;
  /** BBC Good Food is starred and listed first. */
  starred: boolean;
}

/** Search links for a dish. They point at each site's search, not a chosen page, so they can't go dead. */
export function suggestionLinks(dish: string): SuggestionLink[] {
  const q = encodeURIComponent(dish);
  return SITES.map((s) => ({ label: `${dish} on ${s.label}`, url: s.search(q), starred: s.label === "BBC Good Food" }));
}
