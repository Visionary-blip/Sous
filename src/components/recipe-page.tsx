import type { RecipeMatch } from "@/lib/match";

interface Props {
  match: RecipeMatch;
  liked: boolean;
  wished: boolean;
  /** The step being cooked if the cooking bar is on this recipe, else null. */
  cookingStep: number | null;
  onBack: () => void;
  onLike: () => void;
  onWish: () => void;
  onJump: (step: number) => void;
  onComplete: (match: RecipeMatch) => void;
}

const MARKS = { have: "✓", optional: "–", missing: "✕" } as const;

export function RecipePage({ match: m, liked, wished, cookingStep, onBack, onLike, onWish, onJump, onComplete }: Props) {
  return (
    <section className="card recipe-detail">
      <button className="back" onClick={onBack}>
        ← Back
      </button>
      <h2 className="screen-title">{m.recipe.title}</h2>
      <div className="meta">
        {m.recipe.minutes} min · serves {m.recipe.servings}
      </div>

      <div className="actions">
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
                {MARKS[cls]}
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

      <h4>Method</h4>
      <p className="muted hint">Tap a step to start cooking from it.</p>
      <ol className="steps">
        {m.recipe.steps.map((s, i) => (
          <li key={i}>
            <button className={`step ${cookingStep === i ? "now" : ""}`} onClick={() => onJump(i)} aria-current={cookingStep === i ? "step" : undefined}>
              {s}
            </button>
          </li>
        ))}
      </ol>

      {m.usesGroceries.length > 0 && (
        <div className="actions">
          <button onClick={() => onComplete(m)}>Complete</button>
        </div>
      )}
    </section>
  );
}
