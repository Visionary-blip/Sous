import { useState } from "react";
import { Cabinet } from "./components/cabinet";
import { Pantry } from "./components/pantry";
import { Recipes } from "./components/Recipes";
import { starterStaples } from "./data/staples";
import { isExpiringSoon } from "./lib/match";
import { usePersistentState } from "./lib/storage";
import type { GroceryItem, Staple } from "./types";

type Tab = "pantry" | "cabinet" | "recipes";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "pantry", label: "Pantry", icon: "🥕" },
  { id: "cabinet", label: "Cabinet", icon: "🧂" },
  { id: "recipes", label: "Recipes", icon: "🍳" },
];

export default function App() {
  const [tab, setTab] = usePersistentState<Tab>("tab", () => "recipes");
  const [groceries, setGroceries] = usePersistentState<GroceryItem[]>("groceries", () => []);
  const [staples, setStaples] = usePersistentState<Staple[]>("staples", starterStaples);
  const [toast, setToast] = useState<string | null>(null);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  }

  function markCooked(usedIds: string[]) {
    setGroceries((prev) => prev.filter((g) => !usedIds.includes(g.id)));
    flash("Nice! Used-up items removed from your pantry.");
  }

  // A stale saved tab (e.g. the removed "kitchen" or "shopping") falls back to Recipes.
  const current = TABS.some((t) => t.id === tab) ? tab : "recipes";
  const expiring = groceries.filter((g) => isExpiringSoon(g, new Date())).length;

  return (
    <div className="app">
      <header className="top">
        <h1>Sous</h1>
      </header>

      <main>
        {current === "pantry" && <Pantry groceries={groceries} setGroceries={setGroceries} />}
        {current === "cabinet" && <Cabinet staples={staples} setStaples={setStaples} />}
        {current === "recipes" && <Recipes groceries={groceries} staples={staples} onCooked={markCooked} />}
      </main>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      <nav className="tabs" aria-label="Sections">
        <div className="logo" aria-hidden>
          Sous
        </div>
        {TABS.map((t) => (
          <button key={t.id} className={current === t.id ? "on" : ""} onClick={() => setTab(t.id)} aria-current={current === t.id ? "page" : undefined}>
            <span className="tab-icon" aria-hidden>
              {t.icon}
              {t.id === "pantry" && expiring > 0 && <span className="tab-badge">{expiring}</span>}
            </span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
