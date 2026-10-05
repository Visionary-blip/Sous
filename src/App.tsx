import { useMemo, useState } from "react";
import { Cabinet } from "./components/cabinet";
import { CookingBar } from "@/components/cooking-bar";
import { Home } from "@/components/home";
import { ClassicsContext } from "@/lib/classics-context";
import { SUGGESTION_MODE } from "@/lib/mode";
import { RecipeScreen } from "@/components/recipe-screen";
import { RECIPES } from "@/data/recipes";
import { matchAll, type RecipeMatch } from "@/lib/match";
import { consume, applyChanges } from "@/lib/consume";
import { FinishUp, type FinishUpRow } from "@/components/finish-up";
import type { RecipeView } from "@/lib/recipe-view";
import { SavedRecipesContext } from "@/lib/saved-recipes-context";
import { SettingsMenu } from "@/components/settings-menu";
import { fitsDiets, usesAvoided } from "@/lib/diets";
import { ProfilePrefsContext } from "@/lib/profile-prefs-context";
import { ProfileScopeContext } from "@/lib/storage";
import { scopeOf } from "@/lib/profiles";
import { useProfiles } from "@/lib/use-profiles";
import { useClassics } from "@/lib/use-classics";
import { useSavedRecipes } from "@/lib/use-saved-recipes";
import { ExpiryBanner } from "@/components/expiry-banner";
import { ThawBanner } from "@/components/thaw-banner";
import { CookPlanContext } from "@/lib/cook-plan-context";
import { useCookPlan } from "@/lib/use-cook-plan";
import { DinnerDialog } from "@/components/dinner-dialog";
import { dinnerTime } from "@/lib/dinner-time";
import { thawedOut, thawSchedule, type ThawStep } from "@/lib/thaw";
import { useNow } from "@/lib/use-now";
import { useThawAlerts } from "@/lib/use-thaw-alerts";
import { useExpiryAlerts } from "@/lib/use-expiry-alerts";
import { useCooking } from "@/lib/use-cooking";
import { withGroups } from "./lib/food-groups";
import { Pantry } from "./components/pantry";
import { Recipes } from "./components/recipes";
import { starterStaples } from "./data/staples";
import { isExpiringSoon } from "./lib/match";
import { todayIso, usePersistentState } from "./lib/storage";
import type { GroceryItem, Staple } from "./types";

type Tab = "home" | "pantry" | "cabinet" | "recipes";

const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "pantry", label: "Fridge" },
  { id: "cabinet", label: "Cabinet" },
  { id: "recipes", label: "Recipes" },
];

function Kitchen({ profiles }: { profiles: ReturnType<typeof useProfiles> }) {
  const [tab, setTab] = usePersistentState<Tab>("tab", () => "home");
  const [groceries, setGroceries] = usePersistentState<GroceryItem[]>("groceries", () => [], withGroups);
  const [staples, setStaples] = usePersistentState<Staple[]>("staples", starterStaples);
  const [toast, setToast] = useState<string | null>(null);
  const [view, setView] = useState<RecipeView>(null);
  const classics = useClassics();
  const savedRecipes = useSavedRecipes();
  const cook = useCooking();
  const alerts = useExpiryAlerts(groceries);
  const [finishUp, setFinishUp] = useState<FinishUpRow[]>([]);

  function flash(msg: string, ms = 2500) {
    setToast(msg);
    window.setTimeout(() => setToast(null), ms);
  }

  const now = useNow();
  const cookPlan = useCookPlan(flash, profiles.active.dinner);
  const [potFor, setPotFor] = useState<string | null>(null);
  const matches = useMemo(() => matchAll(RECIPES, groceries, staples), [groceries, staples]);
  // Diet and avoided foods hide dishes from the lists; a dish already being cooked or opened stays reachable through byId.
  const visible = useMemo(() => matches.filter((m) => fitsDiets(m.recipe, profiles.active.diets) && !usesAvoided(m.recipe, profiles.active.avoid ?? [])), [matches, profiles.active.diets, profiles.active.avoid]);
  const byId = (id: string | undefined) => matches.find((m) => m.recipe.id === id);
  const cookingMatch = byId(cook.cooking?.id);
  const thawRows = cookPlan.planned.flatMap((p) => {
    const m = byId(p.id);
    const steps = m ? thawSchedule(m, new Date(p.dinnerAt)) : [];
    return m && steps.length > 0 ? [{ id: p.id, dish: m.recipe.title, alerted: Boolean(p.alerted), steps }] : [];
  });
  useThawAlerts(thawRows, now, cookPlan.markAlerted);

  const potMatch = byId(potFor ?? undefined);
  const plannedMeal = cookPlan.planned.find((p) => p.id === potFor);
  const potStart = plannedMeal ? { hour: new Date(plannedMeal.dinnerAt).getHours(), minute: new Date(plannedMeal.dinnerAt).getMinutes() } : dinnerTime(profiles.active.dinner);

  // "It's out": the items come out of the freezer into the fridge, so the reminder clears by itself.
  function itsOut(steps: ThawStep[], dish: string) {
    setGroceries((prev) => thawedOut(prev, steps.map((s) => s.item.id), todayIso()));
    flash(`Moved ${steps.map((s) => s.item.name).join(", ")} to the Fridge for ${dish}.`, 4000);
  }
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
    <ClassicsContext.Provider value={classics}>
    <SavedRecipesContext.Provider value={savedRecipes}>
    <CookPlanContext.Provider value={{ isPlanned: cookPlan.isPlanned, openPot: (m) => setPotFor(m.recipe.id) }}>
    <ProfilePrefsContext.Provider value={{ household: profiles.active.household, units: profiles.active.units, organic: profiles.active.organic }}>
    <div className={`app ${cook.cooking ? "cooking" : ""} ${SUGGESTION_MODE ? "suggest-mode" : ""}`}>
      <header className="top">
        <h1>Sous</h1>
      </header>

      <main>
        <ExpiryBanner alerts={alerts} onFridge={() => goTo("pantry")} />
        <ThawBanner rows={thawRows} now={now} alerts={alerts} onOut={itsOut} onCancel={cookPlan.unplan} />
        {opened ? (
          <RecipeScreen match={opened} classics={classics} cook={cook} onBack={() => setView(null)} onComplete={complete} />
        ) : (
          <>
            {current === "home" && <Home settings={<SettingsMenu api={profiles} />} matches={visible} classics={classics.classics} groceries={groceries} onOpen={openRecipe} onBrowse={() => goTo("recipes")} onPantry={() => goTo("pantry")} />}
            {current === "pantry" && <Pantry groceries={groceries} setGroceries={setGroceries} />}
            {current === "cabinet" && <Cabinet staples={staples} setStaples={setStaples} />}
            {current === "recipes" && <Recipes matches={visible} classics={classics} onOpen={openRecipe} />}
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

      {potMatch && (
        <DinnerDialog
          dish={potMatch.recipe.title}
          start={potStart}
          planned={cookPlan.isPlanned(potMatch.recipe.id)}
          onConfirm={(t) => { cookPlan.plan(potMatch, t); setPotFor(null); }}
          onCancelPlan={() => { cookPlan.unplan(potMatch.recipe.id); setPotFor(null); }}
          onClose={() => setPotFor(null)}
        />
      )}

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
    </ProfilePrefsContext.Provider>
    </CookPlanContext.Provider>
    </SavedRecipesContext.Provider>
    </ClassicsContext.Provider>
  );
}

export default function App() {
  const profiles = useProfiles();
  // Remounting per profile gives each person a fresh fridge, cabinet and Classics read from their own keys.
  return (
    <ProfileScopeContext.Provider value={scopeOf(profiles.active)}>
      <Kitchen key={profiles.active.id} profiles={profiles} />
    </ProfileScopeContext.Provider>
  );
}
