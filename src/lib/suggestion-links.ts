/** Recipe sites whose own search pages take a `q` query; each was opened in a browser on 2026-09-30. */
const SITES: { label: string; search: (q: string) => string }[] = [
  { label: "Allrecipes", search: (q) => `https://www.allrecipes.com/search?q=${q}` },
  { label: "Serious Eats", search: (q) => `https://www.seriouseats.com/search?q=${q}` },
  { label: "BBC Good Food", search: (q) => `https://www.bbcgoodfood.com/search?q=${q}` },
  { label: "Google", search: (q) => `https://www.google.com/search?q=${q}+recipe` },
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
