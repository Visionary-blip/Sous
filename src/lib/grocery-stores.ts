/** US grocery sellers whose own search pages take the item in the address; all five answered 200 to a command-line request on 2026-10-01 (not opened in a browser). */
const STORES: { label: string; search: (q: string) => string }[] = [
  { label: "Instacart", search: (q) => `https://www.instacart.com/store/s?k=${q}` },
  { label: "Walmart", search: (q) => `https://www.walmart.com/search?q=${q}` },
  { label: "Target", search: (q) => `https://www.target.com/s?searchTerm=${q}` },
  { label: "Amazon Fresh", search: (q) => `https://www.amazon.com/s?k=${q}&i=amazonfresh` },
  { label: "Whole Foods", search: (q) => `https://www.wholefoodsmarket.com/search?text=${q}` },
];

export interface StoreLink {
  label: string;
  url: string;
}

/** One search link per store for a missing ingredient. Searches, not stock checks: Sous can't see what a store has. */
export function storeLinks(item: string): StoreLink[] {
  const q = encodeURIComponent(item);
  return STORES.map((s) => ({ label: s.label, url: s.search(q) }));
}

/** Opens a map search for grocery stores around wherever the person is. */
export const NEARBY_STORES_URL = "https://www.google.com/maps/search/?api=1&query=grocery+stores+near+me";
