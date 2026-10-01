import type { ReactNode } from "react";
import { RecipeCard } from "@/components/recipe-card";
import { expiringSoon, expiryLabel } from "@/lib/expiry";
import { homeShelves } from "@/lib/home-shelves";
import type { RecipeMatch } from "@/lib/match";
import type { Classics, GroceryItem } from "@/types";

interface Props {
  /** The settings gear, placed top left. */
  settings: ReactNode;
  matches: RecipeMatch[];
  classics: Classics;
  groceries: GroceryItem[];
  onOpen: (id: string) => void;
  onBrowse: () => void;
  onPantry: () => void;
}

function greeting(hour: number): string {
  if (hour < 12) return "Good morning";
  return hour < 18 ? "Good afternoon" : "Good evening";
}

function subtitle(expiringCount: number): string {
  if (expiringCount === 0) return "Everything in the fridge is fresh.";
  return `${expiringCount} ${expiringCount === 1 ? "thing" : "things"} to use up in the next few days.`;
}

export function Home({ settings, matches, classics, groceries, onOpen, onBrowse, onPantry }: Props) {
  const shelves = homeShelves(matches, classics);
  const today = new Date();
  const soon = expiringSoon(groceries, today);
  return (
    <section>
      {settings}
      <div className="greet">
        <h1>{greeting(new Date().getHours())}</h1>
        <p>{subtitle(soon.length)}</p>
      </div>
      {soon.length > 0 && (
        <div className="shelf-block">
          <div className="sec-h">
            <h2>Expiring soon</h2>
            <p>Tap to see them in your Fridge</p>
          </div>
          <div className="deck">
            {soon.map((g) => (
              <button key={g.id} className={`deck-card ${expiryLabel(g, today)?.tone ?? ""}`} onClick={onPantry}>
                <strong>{g.name}</strong>
                <span>{expiryLabel(g, today)?.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {shelves.length === 0 && (
        <p className="empty">
          Add a few groceries in the <strong>Fridge</strong> tab and Sous will line up what to cook.
        </p>
      )}
      {shelves.map((s) => (
        <div key={s.id} className="shelf-block">
          <div className="sec-h">
            <h2>{s.title}</h2>
            <p>{s.subtitle}</p>
          </div>
          <div className="shelf">
            {s.items.map((m) => (
              <RecipeCard key={m.recipe.id} match={m} onOpen={onOpen} />
            ))}
          </div>
        </div>
      ))}
      <button className="primary" onClick={onBrowse}>
        Browse all recipes
      </button>
    </section>
  );
}
