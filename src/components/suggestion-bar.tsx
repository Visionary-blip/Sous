import { useState } from "react";
import { DishRecipes } from "@/components/dish-recipes";
import { useClassicsContext } from "@/lib/classics-context";
import { coverColors } from "@/lib/cover";
import type { RecipeMatch } from "@/lib/match";
import { readiness } from "@/lib/readiness";
import { suggestionLinks } from "@/lib/suggestion-links";

interface Props {
  match: RecipeMatch;
  /** Plain variant for list rows (Classics, Wishlist), which carry their own buttons. */
  plain?: boolean;
}

/** A dish name on a bar; opening it lists links to recipes for that dish on other sites. */
export function SuggestionBar({ match: m, plain }: Props) {
  const [open, setOpen] = useState(false);
  const { classics, like, wish } = useClassicsContext();
  const id = m.recipe.id;
  const liked = classics.liked.includes(id);
  const wished = classics.wish.includes(id);
  const [from, to] = coverColors(m.recipe);
  const note = m.usesExpiring.length > 0 ? `Uses up ${m.usesExpiring.slice(0, 2).map((g) => g.name).join(" & ")}` : readiness(m).text;

  return (
    <div className={`sbar ${open ? "open" : ""} ${plain ? "plain" : ""}`}>
      <button
        className="sbar-head"
        style={plain ? undefined : { background: `linear-gradient(90deg, ${from}, ${to})` }}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <strong>{m.recipe.title}</strong>
        <small>{note}</small>
        <span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="sbar-body">
          <DishRecipes dishId={id} />
          <p className="sbar-sub">Search elsewhere</p>
          <ul className="sbar-links">
            {suggestionLinks(m.recipe.title).map((l) => (
              <li key={l.url}>
                <a href={l.url} target="_blank" rel="noopener noreferrer">
                  {l.label} ↗
                </a>
              </li>
            ))}
          </ul>
          <div className="actions">
            <button className={`icon ${liked ? "on" : ""}`} aria-pressed={liked} onClick={() => like(id)} aria-label={liked ? "Remove from Classics" : "Add to Classics"}>
              {liked ? "♥" : "♡"}
            </button>
            <button className={`icon ${wished ? "on" : ""}`} aria-pressed={wished} disabled={liked} onClick={() => wish(id)} aria-label={wished ? "Remove from Wishlist" : "Add to Wishlist"}>
              {wished ? "✓" : "+"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
