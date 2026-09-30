import { RecipeCard } from "@/components/recipe-card";
import type { RecipeMatch } from "@/lib/match";

interface Props {
  picks: RecipeMatch[];
  onOpen: (id: string) => void;
  onBrowse: () => void;
}

export function RecipeShelf({ picks, onOpen, onBrowse }: Props) {
  return (
    <div className="shelf">
      {picks.map((m) => (
        <RecipeCard key={m.recipe.id} match={m} onOpen={onOpen} />
      ))}
      <button className="card recipe-card browse-tile" onClick={onBrowse}>
        <span aria-hidden>🔎</span>
        Browse all recipes
      </button>
    </div>
  );
}
