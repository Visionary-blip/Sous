import type { RecipeMatch } from "@/lib/match";

export function readiness(m: RecipeMatch): { text: string; tone: string } {
  if (m.missing.length === 0) return { text: "Ready to cook", tone: "ok" };
  return { text: `Missing ${m.missing.length}`, tone: m.missing.length <= 2 ? "warn" : "muted" };
}

interface Props {
  match: RecipeMatch;
  onOpen: (id: string) => void;
}

export function RecipeCard({ match: m, onOpen }: Props) {
  const status = readiness(m);
  return (
    <button className="card recipe-card" onClick={() => onOpen(m.recipe.id)}>
      <h3>{m.recipe.title}</h3>
      <div className="meta">
        {m.recipe.minutes} min · serves {m.recipe.servings}
      </div>
      <div className="badges">
        <span className={`badge ${status.tone}`}>{status.text}</span>
        {m.usesExpiring.length > 0 && <span className="badge danger">Uses up {m.usesExpiring[0].name}</span>}
      </div>
    </button>
  );
}
