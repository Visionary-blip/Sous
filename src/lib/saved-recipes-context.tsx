import { createContext, useContext } from "react";
import type { useSavedRecipes } from "@/lib/use-saved-recipes";

type SavedRecipesApi = ReturnType<typeof useSavedRecipes>;

/** Shared so every open dish bar reads and writes one saved list instead of each keeping its own copy. */
export const SavedRecipesContext = createContext<SavedRecipesApi | null>(null);

export function useSavedRecipesContext(): SavedRecipesApi {
  const api = useContext(SavedRecipesContext);
  if (!api) throw new Error("SavedRecipesContext.Provider is missing");
  return api;
}
