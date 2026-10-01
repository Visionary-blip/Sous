import { removeRecipe, saveRecipe, type SavedRecipe } from "@/lib/saved-recipes";
import { usePersistentState } from "@/lib/storage";

export function useSavedRecipes() {
  const [saved, setSaved] = usePersistentState<SavedRecipe[]>("saved-recipes", () => []);
  return {
    saved,
    save: (recipe: SavedRecipe) => setSaved((s) => saveRecipe(s, recipe)),
    remove: (dishId: string, url: string) => setSaved((s) => removeRecipe(s, dishId, url)),
  };
}
