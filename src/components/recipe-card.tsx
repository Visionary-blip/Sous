import { coverColors } from "@/lib/cover";
import type { RecipeMatch } from "@/lib/match";

export function readiness(m: RecipeMatch): { text: string; tone: string } {
  if (m.missing.length === 0) return { text: "Ready to cook", tone: "ok" };
  return { text: `Missing ${m.missing.length}`, tone: m.missing.length <= 2 ? "warn" : "muted" };
}

interface Props {
  match: RecipeMatch;
  onOpen: (id: string) => void;
}

/** A square cover with the title on it, like an album, and a one-line status underneath. */
export function RecipeCard({ match: m, onOpen }: Props) {
  const [from, to] = coverColors(m.recipe);
  const note = m.usesExpiring.length > 0 ? `Uses up ${m.usesExpiring[0].name}` : readiness(m).text;
  return (
    <button className="tile" onClick={() => onOpen(m.recipe.id)}>
      <span className="cover" style={{ "--c1": from, "--c2": to } as React.CSSProperties}>
        <span>{m.recipe.title}</span>
      </span>
      <span className="tile-meta">
        {m.recipe.minutes} min · {note}
      </span>
    </button>
  );
}
