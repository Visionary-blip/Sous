import type { SimpleRecipe } from "@api/recipe";

interface RecipeReply {
  recipe?: SimpleRecipe;
  error?: string;
}

/** The one place the app calls the recipe helper; it exists on the dev/preview server only (see server/recipe-proxy.ts). */
export async function fetchSimpleRecipe(url: string): Promise<SimpleRecipe> {
  let body: RecipeReply = {};
  try {
    const res = await fetch(`/api/recipe?url=${encodeURIComponent(url)}`);
    body = (await res.json()) as RecipeReply;
  } catch {
    throw new Error("The recipe helper isn't running here, so Sous can't read that page yet.");
  }
  if (!body.recipe) throw new Error(body.error ?? "Couldn't read that page.");
  return body.recipe;
}
