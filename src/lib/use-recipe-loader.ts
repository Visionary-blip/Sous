import { useState } from "react";
import type { SimpleRecipe } from "@api/recipe";
import { fetchSimpleRecipe } from "@/lib/recipe-api";

/** Reads one recipe page through the helper, tracking the wait and any failure for the button that asked. */
export function useRecipeLoader() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(url: string): Promise<SimpleRecipe | null> {
    setBusy(true);
    setError(null);
    try {
      return await fetchSimpleRecipe(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read that page.");
      return null;
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, load };
}
