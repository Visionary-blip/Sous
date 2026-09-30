import { useMemo, useState } from "react";
import { Cabinet } from "./components/cabinet";
import { CookingBar } from "@/components/cooking-bar";
import { Home } from "@/components/home";
import { RecipeScreen } from "@/components/recipe-screen";
import { RECIPES } from "@/data/recipes";
import { matchAll, type RecipeMatch } from "@/lib/match";
import { consume, applyChanges } from "@/lib/consume";
import { FinishUp, type FinishUpRow } from "@/components/finish-up";
import type { RecipeView } from "@/lib/recipe-view";
import { useClassics } from "@/lib/use-classics";
import { useCooking } from "@/lib/use-cooking";
import { withGroups } from "./lib/food-groups";
import { Pantry } from "./components/pantry";
import { Recipes } from "./components/recipes";
import { starterStaples } from "./data/staples";
import { isExpiringSoon } from "./lib/match";
import { usePersistentState } from "./lib/storage";
import type { GroceryItem, Staple } from "./types";

type Tab = "home" | "pantry" | "cabinet" | "recipes";

const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "pantry", label: "Pantry" },
  { id: "cabinet", label: "Cabinet" },
  { id: "recipes", label: "Recipes" },
];

export default function App() {
  const [tab, setTab] = usePersistentState<Tab>("tab", () => "home");
  const [groceries, setGroceries] = usePersistentState<GroceryItem[]>("groceries", () => [], withGroups);
  const [staples, setStaples] = usePersistentState<Staple[]>("staples", starterStaples);
  const [toast, setToast] = useState<string | null>(null);
  const [view, setView] = useState<RecipeView>(null);
  const classics = useClassics();
  const cook = useCooking();
  const [finishUp, setFinishUp] = useState<FinishUpRow[]>([]);

  function flash(msg: string, ms = 2500) {
    setToast(msg);
    window.setTimeout(() => setToast(null), ms);
  }

  const matches = useMemo(() => matchAll(RECIPES, groceries, staples), [groceries, staples]);
  const byId = (id: string | undefined) => matches.find((m) => m.recipe.id === id);
  const cookingMatch = byId(cook.cooking?.id);
  const opened = byId(view?.id);

  // Subtract what the recipe used; anything Sous can't work out is handed to the person.
  function complete(match: RecipeMatch) {
    const { changes, unresolved } = consume(match);
    setGroceries((prev) => applyChanges(prev, changes));
    if (changes.length) flash(`Used ${changes.map((c) => c.used).join(", ")}`, 4500);
    setFinishUp(unresolved.map((u) => ({ id: u.item.id, needed: u.needed })));
    cook.stop();
  }

  function openRecipe(id: string) {
    setView({ id });
    window.scrollTo(0, 0);
  }

  // Choosing a tab closes any recipe page, so the tab bar always takes you somewhere.
  function goTo(next: Tab) {
    setView(null);
    setTab(next);
    window.scrollTo(0, 0);
  }

  // A stale saved tab (e.g. the removed "kitchen" or "shopping") falls back to Home.
  const current = TABS.some((t) => t.id === tab) ? tab : "home";
  const expiring = groceries.filter((g) => isExpiringSoon(g, new Date())).length;

  return (
    <div className={`app ${cook.cooking ? "cooking" : ""}`}>
      <header className="top">
        <h1>Sous</h1>
      </header>

      <main>
        {opened ? (
          <RecipeScreen match={opened} classics={classics} cook={cook} onBack={() => setView(null)} onComplete={complete} />
        ) : (
          <>
            {current === "home" && <Home matches={matches} classics={classics.classics} groceries={groceries} onOpen={openRecipe} onBrowse={() => goTo("recipes")} onPantry={() => goTo("pantry")} />}
            {current === "pantry" && <Pantry groceries={groceries} setGroceries={setGroceries} />}
            {current === "cabinet" && <Cabinet staples={staples} setStaples={setStaples} />}
            {current === "recipes" && <Recipes matches={matches} classics={classics} onOpen={openRecipe} />}
          </>
        )}
      </main>

      {cook.cooking && cookingMatch && (
        <CookingBar
          match={cookingMatch}
          cooking={cook.cooking}
          liked={classics.classics.liked.includes(cook.cooking.id)}
          onOpen={() => openRecipe(cook.cooking!.id)}
          onStep={(delta) => cook.step(delta, cookingMatch.recipe.steps.length)}
          onLike={() => classics.like(cook.cooking!.id)}
          onStop={cook.stop}
          onComplete={() => complete(cookingMatch)}
        />
      )}

      {finishUp.length > 0 && <FinishUp rows={finishUp} groceries={groceries} setGroceries={setGroceries} onClose={() => setFinishUp([])} />}

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
          <button key={t.id} className={current === t.id ? "on" : ""} onClick={() => goTo(t.id)} aria-current={current === t.id ? "page" : undefined}>
            {t.label}
            {t.id === "pantry" && expiring > 0 && <span className="tab-badge">{expiring}</span>}
          </button>
        ))}
      </nav>
    </div>
  );
}
