import { useState, type FormEvent } from "react";
import { CreditMark, HeartIcon, StarIcon } from "@/components/marks";
import { SEED_RECIPES } from "@/data/seed-recipes";
import type { SimpleRecipe } from "@api/recipe";
import { convertUnits } from "@/lib/convert-units";
import { useProfilePrefs } from "@/lib/profile-prefs-context";
import { entriesForDish, type RecipeEntry } from "@/lib/saved-recipes";
import { useClassicsContext } from "@/lib/classics-context";
import { useSavedRecipesContext } from "@/lib/saved-recipes-context";
import { useRecipeLoader } from "@/lib/use-recipe-loader";

function RecipeBody({ recipe }: { recipe: SimpleRecipe }) {
  const { units } = useProfilePrefs();
  const show = (text: string) => (units ? convertUnits(text, units) : text);
  return (
    <div className="dr-body">
      <p className="dr-meta">
        <CreditMark />{" "}
        {recipe.minutes ? `${recipe.minutes} min · ` : ""}shortened from{" "}
        <a href={recipe.url} target="_blank" rel="noopener noreferrer">
          {recipe.source} ↗
        </a>
      </p>
      <h4>Ingredients</h4>
      <ul>{recipe.ingredients.map((i, n) => <li key={n}>{show(i)}</li>)}</ul>
      <h4>Steps</h4>
      <ol>{recipe.steps.map((s, n) => <li key={n}>{show(s)}</li>)}</ol>
    </div>
  );
}

function RecipeRow({ dishId, entry, liked }: { dishId: string; entry: RecipeEntry; liked: boolean }) {
  const [open, setOpen] = useState(false);
  const { saved, save, remove } = useSavedRecipesContext();
  const { busy, error, load } = useRecipeLoader();
  const recipe = entry.recipe ?? saved.find((r) => r.dishId === dishId && r.url === entry.url) ?? null;

  async function toggle() {
    if (!open && !recipe) {
      const read = await load(entry.url);
      if (!read) return;
      save({ ...read, dishId });
    }
    setOpen(!open);
  }

  return (
    <li className="dr-row">
      <button className="dr-head" onClick={toggle} aria-expanded={open} disabled={busy}>
        <span className="dr-label">
          {entry.starred && <StarIcon />}
          {liked && <HeartIcon />}
          {entry.label}
        </span>
        <span aria-hidden>{busy ? "…" : open ? "−" : "+"}</span>
      </button>
      {error && (
        <p className="dr-error" role="alert">
          {error}{" "}
          <a href={entry.url} target="_blank" rel="noopener noreferrer">
            Open the original ↗
          </a>
        </p>
      )}
      {open && recipe && <RecipeBody recipe={recipe} />}
      {open && !entry.seeded && <button className="dr-remove" onClick={() => remove(dishId, entry.url)}>Remove this recipe</button>}
    </li>
  );
}

function AddRecipe({ dishId }: { dishId: string }) {
  const [text, setText] = useState("");
  const { save } = useSavedRecipesContext();
  const { busy, error, load } = useRecipeLoader();

  async function submit(e: FormEvent) {
    e.preventDefault();
    const read = await load(text.trim());
    if (!read) return;
    save({ ...read, dishId });
    setText("");
  }

  return (
    <form className="dr-add" onSubmit={submit}>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste a recipe link" aria-label="Recipe link" type="url" required />
      <button type="submit" disabled={busy}>{busy ? "Reading…" : "Add"}</button>
      {error && <p className="dr-error" role="alert">{error}</p>}
    </form>
  );
}

/** Simplified recipes saved under a dish, each opening to ingredients and short steps, plus a box to add more. */
export function DishRecipes({ dishId }: { dishId: string }) {
  const { saved } = useSavedRecipesContext();
  const liked = useClassicsContext().classics.liked.includes(dishId);
  const entries = entriesForDish(dishId, saved, SEED_RECIPES[dishId] ?? []);
  return (
    <div className="dr">
      {entries.length > 0 && <ul className="dr-list">{entries.map((e) => <RecipeRow key={e.url} dishId={dishId} entry={e} liked={liked} />)}</ul>}
      <AddRecipe dishId={dishId} />
    </div>
  );
}
