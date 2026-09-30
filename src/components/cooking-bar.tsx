import type { RecipeMatch } from "@/lib/match";
import type { Cooking } from "@/lib/cooking";

interface Props {
  match: RecipeMatch;
  cooking: Cooking;
  liked: boolean;
  onOpen: () => void;
  onStep: (delta: 1 | -1) => void;
  onLike: () => void;
  onStop: () => void;
  onComplete: () => void;
}

export function CookingBar({ match: m, cooking, liked, onOpen, onStep, onLike, onStop, onComplete }: Props) {
  const total = Math.max(1, m.recipe.steps.length);
  const step = Math.min(cooking.step, total - 1);
  const status = cooking.done ? "Finished" : `Now cooking · step ${step + 1} of ${total}`;
  const text = cooking.done ? "Nice work. Tap the heart if it's a keeper." : (m.recipe.steps[step] ?? "Follow along in the recipe.");

  return (
    <aside className="cook-bar" aria-label="Now cooking">
      <button className="cook-who" onClick={onOpen}>
        <strong>{m.recipe.title}</strong>
        <small>{status}</small>
      </button>
      <div className="cook-ctl">
        <button className="icon" onClick={() => onStep(-1)} disabled={step === 0 && !cooking.done} aria-label="Previous step">
          ‹
        </button>
        <button className="icon primary" onClick={() => onStep(1)} disabled={cooking.done} aria-label={cooking.done ? "Finished" : "Next step"}>
          {cooking.done ? "✓" : "›"}
        </button>
      </div>
      <p className="cook-text" aria-live="polite">
        {text}
      </p>
      <div className="cook-end">
        {cooking.done && m.usesGroceries.length > 0 && <button onClick={onComplete}>Complete</button>}
        <button className={`icon ${liked ? "on" : ""}`} aria-pressed={liked} onClick={onLike} aria-label={liked ? "Remove from Classics" : "Add to Classics"}>
          {liked ? "♥" : "♡"}
        </button>
        <button className="icon" onClick={onStop} aria-label="Stop cooking">
          ✕
        </button>
      </div>
    </aside>
  );
}
