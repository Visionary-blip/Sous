import { useState } from "react";
import { RecipeCard } from "@/components/recipe-card";
import type { RecipeMatch } from "@/lib/match";
import { BROWSE_CHIPS, filterMatches, type BrowseChip } from "@/lib/recipe-filters";

interface Props {
  matches: RecipeMatch[];
  onOpen: (id: string) => void;
  onBack: () => void;
}

export function Browse({ matches, onOpen, onBack }: Props) {
  const [query, setQuery] = useState("");
  const [chips, setChips] = useState<BrowseChip[]>([]);
  const shown = filterMatches(matches, query, chips);

  function toggleChip(id: BrowseChip) {
    setChips((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  }

  return (
    <section>
      <button className="back" onClick={onBack}>
        ← Back
      </button>
      <h2 className="screen-title">Browse all recipes</h2>
      <input
        className="search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search recipes or ingredients…"
        aria-label="Search recipes"
      />
      <div className="filters">
        {BROWSE_CHIPS.map((c) => (
          <button key={c.id} className={`pill ${chips.includes(c.id) ? "on" : ""}`} aria-pressed={chips.includes(c.id)} onClick={() => toggleChip(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      {shown.length === 0 && <p className="empty">No recipes match those filters.</p>}
      <div className="grid">
        {shown.map((m) => (
          <RecipeCard key={m.recipe.id} match={m} onOpen={onOpen} />
        ))}
      </div>
    </section>
  );
}
