import { useMemo, useState } from "react";
import { RECIPES } from "../data/recipes";
import { recommend, type RecipeMatch } from "../lib/match";
import type { GroceryItem, Staple } from "../types";

type Readiness = "all" | "ready" | "almost";

const MEALS = ["breakfast", "lunch", "dinner", "side", "baking"];

interface Props {
  groceries: GroceryItem[];
  staples: Staple[];
  onCooked: (usedIds: string[]) => void;
}

export function Recipes({ groceries, staples, onCooked }: Props) {
  const [readiness, setReadiness] = useState<Readiness>("all");
  const [meal, setMeal] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const matches = useMemo(() => recommend(RECIPES, groceries, staples), [groceries, staples]);

  const q = query.trim().toLowerCase();
  const shown = matches.filter((m) => {
    if (readiness === "ready" && m.missing.length > 0) return false;
    if (readiness === "almost" && (m.missing.length === 0 || m.missing.length > 2)) return false;
    if (meal && !m.recipe.tags.includes(meal)) return false;
    if (q) {
      const hay = [m.recipe.title, ...m.recipe.tags, ...m.recipe.ingredients.map((i) => i.name)].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const readyCount = matches.filter((m) => m.missing.length === 0).length;

  if (groceries.length === 0) {
    return (
      <p className="empty">
        Add a few groceries in the <strong>Pantry</strong> tab and Sous will suggest what to cook.
      </p>
    );
  }

  return (
    <section>
      <p className="intro">
        {readyCount > 0 ? (
          <>
            You can make <strong>{readyCount}</strong> {readyCount === 1 ? "recipe" : "recipes"} right now.
          </>
        ) : (
          <>Nothing's fully ready yet — here's what you're closest to.</>
        )}{" "}
        Recipes using food that's about to expire are shown first.
      </p>

      <input
        className="search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search recipes or ingredients…"
        aria-label="Search recipes"
      />

      <div className="filters">
        {(
          [
            ["all", "All"],
            ["ready", "Ready to cook"],
            ["almost", "Missing 1–2"],
          ] as [Readiness, string][]
        ).map(([id, label]) => (
          <button key={id} className={`pill ${readiness === id ? "on" : ""}`} onClick={() => setReadiness(id)}>
            {label}
          </button>
        ))}
        <span className="divider" />
        {MEALS.map((m) => (
          <button key={m} className={`pill ${meal === m ? "on" : ""}`} onClick={() => setMeal(meal === m ? null : m)}>
            {m}
          </button>
        ))}
      </div>

      {shown.length === 0 && <p className="empty">No recipes match those filters.</p>}

      <ul className="recipes">
        {shown.map((m) => (
          <RecipeCard
            key={m.recipe.id}
            match={m}
            open={openId === m.recipe.id}
            onToggle={() => setOpenId(openId === m.recipe.id ? null : m.recipe.id)}
            onCooked={onCooked}
          />
        ))}
      </ul>
    </section>
  );
}

function RecipeCard({
  match: m,
  open,
  onToggle,
  onCooked,
}: {
  match: RecipeMatch;
  open: boolean;
  onToggle: () => void;
  onCooked: (usedIds: string[]) => void;
}) {
  const pct = Math.round(m.score * 100);
  const status =
    m.missing.length === 0
      ? { text: "Ready to cook", tone: "ok" }
      : { text: `Missing ${m.missing.length}`, tone: m.missing.length <= 2 ? "warn" : "muted" };

  return (
    <li className="card recipe">
      <button className="recipe-head" onClick={onToggle} aria-expanded={open}>
        <div className="grow">
          <h3>{m.recipe.title}</h3>
          <div className="meta">
            {m.recipe.minutes} min · serves {m.recipe.servings}
          </div>
          <div className="badges">
            <span className={`badge ${status.tone}`}>{status.text}</span>
            {m.usesExpiring.length > 0 && (
              <span className="badge danger">Uses {m.usesExpiring.map((g) => g.name).join(", ")} before it spoils</span>
            )}
          </div>
        </div>
        <div className="score" aria-label={`${pct}% of ingredients on hand`}>
          <svg viewBox="0 0 36 36" width="44" height="44" aria-hidden>
            <circle cx="18" cy="18" r="15.5" className="ring-bg" />
            <circle cx="18" cy="18" r="15.5" className="ring" strokeDasharray={`${pct * 0.974} 100`} />
          </svg>
          <span>{pct}%</span>
        </div>
      </button>

      {open && (
        <div className="recipe-body">
          <h4>Ingredients</h4>
          <ul className="ingredients">
            {m.ingredients.map(({ ingredient, source }) => {
              const cls = source ? "have" : ingredient.optional ? "optional" : "missing";
              const from =
                source?.kind === "grocery"
                  ? `your ${source.item.name.toLowerCase()}`
                  : source?.kind === "staple"
                    ? "staples"
                    : null;
              return (
                <li key={ingredient.name} className={cls}>
                  <span className="mark" aria-hidden>
                    {source ? "✓" : ingredient.optional ? "○" : "✗"}
                  </span>
                  <span className="grow">
                    {ingredient.name}
                    {ingredient.amount && <span className="muted"> — {ingredient.amount}</span>}
                    {ingredient.optional && !source && <span className="muted"> (optional)</span>}
                  </span>
                  {from && <span className="from">{from}</span>}
                </li>
              );
            })}
          </ul>

          <h4>Steps</h4>
          <ol className="steps">
            {m.recipe.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>

          <div className="actions">
            {m.usesGroceries.length > 0 && (
              <button
                className="primary"
                onClick={() => {
                  const names = m.usesGroceries.map((g) => g.name).join(", ");
                  if (confirm(`Mark as cooked and remove these from your kitchen?\n\n${names}`)) {
                    onCooked(m.usesGroceries.map((g) => g.id));
                  }
                }}
              >
                I cooked this
              </button>
            )}
          </div>
        </div>
      )}
    </li>
  );
}
