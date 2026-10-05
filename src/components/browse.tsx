import { RecipeCard } from "@/components/recipe-card";
import { CUISINES } from "@/data/cuisines";
import type { RecipeMatch } from "@/lib/match";
import { groupByTimeOfDay } from "@/lib/meal-groups";
import { BROWSE_CHIPS, filterMatches, sortByTitle } from "@/lib/recipe-filters";
import { useBrowseFilters } from "@/lib/use-browse-filters";

interface Props {
  matches: RecipeMatch[];
  onOpen: (id: string) => void;
}

export function Browse({ matches, onOpen }: Props) {
  const f = useBrowseFilters();
  const shown = filterMatches(matches, f.query, f.chips, f.cuisines);
  // The fridge-based picks live on Home; here every dish just sits in its time-of-day group, A to Z.
  const groups = groupByTimeOfDay(sortByTitle(shown));

  return (
    <section>
      <input
        className="search"
        type="search"
        value={f.query}
        onChange={(e) => f.setQuery(e.target.value)}
        placeholder="Search recipes or ingredients…"
        aria-label="Search recipes"
      />
      <div className="filters">
        {BROWSE_CHIPS.map((c) => (
          <button key={c.id} className={`pill ${f.chips.includes(c.id) ? "on" : ""}`} aria-pressed={f.chips.includes(c.id)} onClick={() => f.toggleChip(c.id)}>
            {c.label}
          </button>
        ))}
        <button className={`pill ${f.cuisines.length > 0 ? "on" : ""}`} aria-expanded={f.ethnicityOpen} onClick={f.toggleEthnicity}>
          Ethnicity{f.cuisines.length > 0 ? ` · ${f.cuisines.length}` : ""}
        </button>
      </div>
      {f.ethnicityOpen && (
        <div className="filters" role="group" aria-label="Ethnicity">
          {CUISINES.map((c) => (
            <button key={c} className={`pill ${f.cuisines.includes(c) ? "on" : ""}`} aria-pressed={f.cuisines.includes(c)} onClick={() => f.toggleCuisine(c)}>
              {c}
            </button>
          ))}
        </div>
      )}
      {shown.length === 0 && <p className="empty">No recipes match those filters.</p>}
      {groups.map((g) => (
        <div key={g.id} className="shelf-block">
          <div className="sec-h">
            <h2>{g.label}</h2>
          </div>
          <div className="grid">
            {g.items.map((m) => (
              <RecipeCard key={m.recipe.id} match={m} onOpen={onOpen} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
