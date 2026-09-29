import { useState } from "react";
import { Kitchen } from "./components/Kitchen";
import { Recipes } from "./components/Recipes";
import { Shopping } from "./components/Shopping";
import { Staples } from "./components/Staples";
import { starterStaples } from "./data/staples";
import { normalize, satisfies } from "./lib/ingredients";
import { isExpiringSoon } from "./lib/match";
import { newId, todayIso, usePersistentState } from "./lib/storage";
import type { GroceryItem, ShoppingItem, Staple } from "./types";

type Tab = "kitchen" | "staples" | "recipes" | "shopping";

export default function App() {
  const [tab, setTab] = usePersistentState<Tab>("tab", () => "kitchen");
  const [groceries, setGroceries] = usePersistentState<GroceryItem[]>("groceries", () => []);
  const [staples, setStaples] = usePersistentState<Staple[]>("staples", starterStaples);
  const [shopping, setShopping] = usePersistentState<ShoppingItem[]>("shopping", () => []);
  const [toast, setToast] = useState<string | null>(null);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2500);
  }

  function addToShopping(names: string[]) {
    setShopping((prev) => {
      const have = new Set(prev.map((i) => normalize(i.name)));
      const fresh = names
        .filter((n) => !have.has(normalize(n)))
        .map((n) => ({ id: newId(), name: n, done: false }));
      return [...prev, ...fresh];
    });
    flash(`Added to shopping list`);
  }

  function markCooked(usedIds: string[]) {
    setGroceries((prev) => prev.filter((g) => !usedIds.includes(g.id)));
    flash("Nice! Used-up items removed from your kitchen.");
  }

  /** Checked-off shopping items: restock matching staples, everything else goes in the fridge. */
  function putAway(items: ShoppingItem[]) {
    const toStaples = new Set<string>();
    const toGroceries: GroceryItem[] = [];
    for (const item of items) {
      const staple = staples.find((s) => satisfies(s.name, item.name));
      if (staple) toStaples.add(staple.id);
      else
        toGroceries.push({ id: newId(), name: item.name, location: "fridge", addedOn: todayIso() });
    }
    setStaples((prev) => prev.map((s) => (toStaples.has(s.id) ? { ...s, inStock: true } : s)));
    setGroceries((prev) => [...toGroceries, ...prev]);
    const ids = new Set(items.map((i) => i.id));
    setShopping((prev) => prev.filter((i) => !ids.has(i.id)));
    flash(`Put away ${items.length} ${items.length === 1 ? "item" : "items"}`);
  }

  const expiring = groceries.filter((g) => isExpiringSoon(g, new Date())).length;
  const openShopping = shopping.filter((i) => !i.done).length;

  const tabs: { id: Tab; label: string; icon: string; badge?: number }[] = [
    { id: "kitchen", label: "Kitchen", icon: "🧊", badge: expiring || undefined },
    { id: "staples", label: "Staples", icon: "🧂" },
    { id: "recipes", label: "Recipes", icon: "🍳" },
    { id: "shopping", label: "List", icon: "🛒", badge: openShopping || undefined },
  ];

  return (
    <div className="app">
      <header className="top">
        <h1>Sous</h1>
        <span className="tagline">{tabs.find((t) => t.id === tab)?.label}</span>
      </header>

      <main>
        {tab === "kitchen" && <Kitchen groceries={groceries} setGroceries={setGroceries} />}
        {tab === "staples" && <Staples staples={staples} setStaples={setStaples} />}
        {tab === "recipes" && (
          <Recipes groceries={groceries} staples={staples} onAddToShopping={addToShopping} onCooked={markCooked} />
        )}
        {tab === "shopping" && (
          <Shopping items={shopping} setItems={setShopping} onAdd={addToShopping} onStock={putAway} />
        )}
      </main>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}

      <nav className="tabs" aria-label="Sections">
        {tabs.map((t) => (
          <button key={t.id} className={tab === t.id ? "on" : ""} onClick={() => setTab(t.id)} aria-current={tab === t.id ? "page" : undefined}>
            <span className="tab-icon" aria-hidden>
              {t.icon}
              {t.badge !== undefined && <span className="tab-badge">{t.badge}</span>}
            </span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
