import type { RecipeMatch } from "@/lib/match";
import { togglePlanned } from "@/lib/cook-plan";
import { showNotification } from "@/lib/notify";
import { usePersistentState } from "@/lib/storage";
import { thawMessage, thawNeeded } from "@/lib/thaw";

/** Meals the person said they will cook; planning one tells them what to thaw first, as a toast and a system alert when allowed. */
export function useCookPlan(flash: (msg: string, ms?: number) => void) {
  const [planned, setPlanned] = usePersistentState<string[]>("planned", () => []);

  function toggle(match: RecipeMatch) {
    const id = match.recipe.id;
    setPlanned((p) => togglePlanned(p, id));
    if (planned.includes(id)) return;
    const thaw = thawNeeded(match);
    if (thaw.length === 0) return flash(`Planned ${match.recipe.title}. Nothing in the freezer to thaw.`, 3500);
    const { title, body } = thawMessage(match.recipe.title, thaw);
    flash(`${title}: ${thaw.map((t) => t.name).join(", ")}`, 5000);
    void showNotification(title, body);
  }

  return { planned, toggle, unplan: (id: string) => setPlanned((p) => p.filter((x) => x !== id)) };
}
