import { useState } from "react";
import type { Cuisine } from "@/data/cuisines";
import type { BrowseChip } from "@/lib/recipe-filters";

function toggled<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

/** The search text, the filter chips, and the cuisines behind the Ethnicity button on the Browse screen. */
export function useBrowseFilters() {
  const [query, setQuery] = useState("");
  const [chips, setChips] = useState<BrowseChip[]>([]);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [ethnicityOpen, setEthnicityOpen] = useState(false);
  return {
    query,
    setQuery,
    chips,
    cuisines,
    ethnicityOpen,
    toggleEthnicity: () => setEthnicityOpen((open) => !open),
    toggleChip: (id: BrowseChip) => setChips((prev) => toggled(prev, id)),
    toggleCuisine: (id: Cuisine) => setCuisines((prev) => toggled(prev, id)),
  };
}
