import { useState } from "react";
import { CreditMark } from "@/components/marks";
import { useProfilePrefs } from "@/lib/profile-prefs-context";
import { NEARBY_STORES_URL, storeLinks } from "@/lib/grocery-stores";
import type { RecipeIngredient } from "@/types";

/** A small button that lists where each missing required ingredient can be bought. Renders nothing when none is missing. */
export function StoreFinder({ missing }: { missing: RecipeIngredient[] }) {
  const [open, setOpen] = useState(false);
  const organic = Boolean(useProfilePrefs().organic);
  if (missing.length === 0) return null;
  return (
    <div className="stores">
      <button type="button" className="stores-btn" onClick={() => setOpen(!open)} aria-expanded={open}>
        Where to buy {missing.length === 1 ? "the missing item" : `${missing.length} missing items`}
      </button>
      <CreditMark />
      {open && (
        <div className="stores-panel">
          {missing.map((m) => (
            <p key={m.name} className="stores-row">
              <strong>{m.name}</strong>
              {storeLinks(m.name, organic).map((l) => (
                <a key={l.label} href={l.url} className={l.organic ? "organic-link" : undefined} target="_blank" rel="noopener noreferrer">
                  {l.label} ↗
                </a>
              ))}
            </p>
          ))}
          <p className="stores-row">
            <a href={NEARBY_STORES_URL} target="_blank" rel="noopener noreferrer">
              Grocery stores near you ↗
            </a>
          </p>
          <small>These open each store's search; Sous can't see what is in stock.{organic && " Green stores are the organic-focused ones."}</small>
        </div>
      )}
    </div>
  );
}
