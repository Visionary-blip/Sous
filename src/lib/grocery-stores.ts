/** US grocery sellers whose own search pages take the item in the address; all five answered 200 to a command-line request on 2026-10-01 (not opened in a browser). */
interface Store {
  label: string;
  search: (q: string) => string;
  /** Known for organic food; listed first and shown green when Organic is on. My judgement, not a certification. */
  organicFocus?: boolean;
  /** Only offered when Organic is on (an online shelf-stable shop, so not useful for fresh food in general). */
  organicOnly?: boolean;
}

const STORES: Store[] = [
  { label: "Instacart", search: (q) => `https://www.instacart.com/store/s?k=${q}` },
  { label: "Walmart", search: (q) => `https://www.walmart.com/search?q=${q}` },
  { label: "Target", search: (q) => `https://www.target.com/s?searchTerm=${q}` },
  { label: "Amazon Fresh", search: (q) => `https://www.amazon.com/s?k=${q}&i=amazonfresh` },
  { label: "Whole Foods", search: (q) => `https://www.wholefoodsmarket.com/search?text=${q}`, organicFocus: true },
  { label: "Thrive Market", search: (q) => `https://thrivemarket.com/search?q=${q}`, organicFocus: true, organicOnly: true },
];

export interface StoreLink {
  label: string;
  url: string;
  /** True for the organic-focused stores when Organic is on, so they can be coloured. */
  organic: boolean;
}

/**
 * One search link per store for a missing ingredient. Searches, not stock checks: Sous can't see what a
 * store has. With `organic` on, the search asks for "organic <item>" and organic-focused stores come first.
 */
export function storeLinks(item: string, organic = false): StoreLink[] {
  const q = encodeURIComponent(organic ? `organic ${item}` : item);
  const stores = STORES.filter((s) => organic || !s.organicOnly);
  const links = stores.map((s) => ({ label: s.label, url: s.search(q), organic: organic && Boolean(s.organicFocus) }));
  return organic ? [...links.filter((l) => l.organic), ...links.filter((l) => !l.organic)] : links;
}

/** Opens a map search for grocery stores around wherever the person is. */
export const NEARBY_STORES_URL = "https://www.google.com/maps/search/?api=1&query=grocery+stores+near+me";
