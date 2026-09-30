import { readiness } from "@/components/recipe-card";
import type { RecipeMatch } from "@/lib/match";

interface Props {
  kind: "liked" | "wish";
  matches: RecipeMatch[];
  onOpen: (id: string) => void;
  onLike: (id: string) => void;
  onRemove: (id: string) => void;
}

const EMPTY_TEXT = {
  liked: "No classics yet. Open a recipe and tap the heart on meals you love — Sous will tell you when you can make them again.",
  wish: "Your wishlist is empty. Open a recipe and tap + on dishes you want to try.",
};

export function ClassicsList({ kind, matches, onOpen, onLike, onRemove }: Props) {
  if (matches.length === 0) return <p className="empty">{EMPTY_TEXT[kind]}</p>;
  return (
    <ul className="list">
      {matches.map((m) => (
        <li key={m.recipe.id} className="list-item">
          <button className="row-open grow" onClick={() => onOpen(m.recipe.id)}>
            <strong>{m.recipe.title}</strong>
            <span className="meta">{describe(m, kind)}</span>
          </button>
          {kind === "wish" && <button onClick={() => onLike(m.recipe.id)}>Made it, loved it</button>}
          <button className="icon" onClick={() => onRemove(m.recipe.id)} aria-label={`Remove ${m.recipe.title}`}>
            ✕
          </button>
        </li>
      ))}
    </ul>
  );
}

function describe(m: RecipeMatch, kind: "liked" | "wish"): string {
  if (kind === "wish" && m.missing.length > 0) return `Need to buy: ${m.missing.map((i) => i.name).join(", ")}`;
  return m.missing.length === 0 ? "You can make this now" : readiness(m).text;
}
