import { SuggestionBar } from "@/components/suggestion-bar";
import { coverBackground, coverInk } from "@/lib/cover";
import type { RecipeMatch } from "@/lib/match";
import { SUGGESTION_MODE } from "@/lib/mode";
import { readiness } from "@/lib/readiness";

interface Props {
  match: RecipeMatch;
  onOpen: (id: string) => void;
}

/** A square cover with the title on it, like an album, and a one-line status underneath. */
export function RecipeCard({ match: m, onOpen }: Props) {
  if (SUGGESTION_MODE) return <SuggestionBar match={m} />;
  const note = m.usesExpiring.length > 0 ? `Uses up ${m.usesExpiring.slice(0, 2).map((g) => g.name).join(" & ")}` : readiness(m).text;
  return (
    <button className="tile" onClick={() => onOpen(m.recipe.id)}>
      <span className="cover" style={{ background: coverBackground(m.recipe) }}>
        <span style={{ color: coverInk(m.recipe) }}>{m.recipe.title}</span>
      </span>
      <span className="tile-meta">
        {m.recipe.minutes} min · {note}
      </span>
    </button>
  );
}
