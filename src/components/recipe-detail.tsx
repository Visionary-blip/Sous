import type { RecipeMatch } from "@/lib/match";

interface Props {
  match: RecipeMatch;
  liked: boolean;
  wished: boolean;
  onBack: () => void;
  onLike: () => void;
  onWish: () => void;
  onCooked: (usedIds: string[]) => void;
}

// Interim page: step 5 replaces this with the full recipe page and the cooking bar.
export function RecipeDetail({ match: m, liked, wished, onBack, onLike, onWish, onCooked }: Props) {
  return (
    <section className="card recipe-detail">
      <button className="back" onClick={onBack}>
        ← Back
      </button>
      <div className="detail-head">
        <div className="grow">
          <h2 className="screen-title">{m.recipe.title}</h2>
          <div className="meta">
            {m.recipe.minutes} min · serves {m.recipe.servings}
          </div>
        </div>
        <button className={`icon ${liked ? "on" : ""}`} aria-pressed={liked} onClick={onLike} aria-label={liked ? "Remove from Classics" : "Add to Classics"}>
          {liked ? "♥" : "♡"}
        </button>
        <button className={`icon ${wished ? "on" : ""}`} aria-pressed={wished} disabled={liked} onClick={onWish} aria-label={wished ? "Remove from Wishlist" : "Add to Wishlist"}>
          {wished ? "✓" : "+"}
        </button>
      </div>

      <h4>Ingredients</h4>
      <ul className="ingredients">
        {m.ingredients.map(({ ingredient, source }) => {
          const cls = source ? "have" : ingredient.optional ? "optional" : "missing";
          const from = source?.kind === "grocery" ? `your ${source.item.name.toLowerCase()}` : source?.kind === "staple" ? "staples" : null;
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

      {m.usesGroceries.length > 0 && (
        <div className="actions">
          <button className="primary" onClick={() => cooked(m, onCooked)}>
            I cooked this
          </button>
        </div>
      )}
    </section>
  );
}

function cooked(m: RecipeMatch, onCooked: (usedIds: string[]) => void) {
  const names = m.usesGroceries.map((g) => g.name).join(", ");
  if (confirm(`Mark as cooked and remove these from your pantry?\n\n${names}`)) {
    onCooked(m.usesGroceries.map((g) => g.id));
  }
}
