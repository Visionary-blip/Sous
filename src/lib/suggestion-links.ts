/** Recipe sites whose own search pages take a `q` query; Allrecipes and BBC Good Food were opened in a browser on 2026-09-30; NYT Cooking's search answered 200 to a command-line request but cannot be opened in the in-app browser. */
const SITES: { label: string; search: (q: string) => string }[] = [
  { label: "Allrecipes", search: (q) => `https://www.allrecipes.com/search?q=${q}` },
  { label: "BBC Good Food", search: (q) => `https://www.bbcgoodfood.com/search?q=${q}` },
  { label: "NYT Cooking", search: (q) => `https://cooking.nytimes.com/search?q=${q}` },
];

export interface SuggestionLink {
  label: string;
  url: string;
}

/** Search links for a dish. They point at each site's search, not a chosen page, so they can't go dead. */
export function suggestionLinks(dish: string): SuggestionLink[] {
  const q = encodeURIComponent(dish);
  return SITES.map((s) => ({ label: `${dish} on ${s.label}`, url: s.search(q) }));
}
