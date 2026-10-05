import type { RecipeMatch } from "@/lib/match";
import { isPlanned, markAlerted, planMeal, upgradePlanned, type PlannedMeal } from "@/lib/cook-plan";
import { formatTime, nextDinner, type DinnerPref, type TimeOfDay } from "@/lib/dinner-time";
import { showNotification } from "@/lib/notify";
import { usePersistentState } from "@/lib/storage";
import { thawMessage, thawSchedule } from "@/lib/thaw";

/**
 * Meals the person said they will cook. Planning one aims it at the dinner time they chose and, if
 * something must come out of the freezer, says when, as a toast and a system alert when allowed.
 */
export function useCookPlan(flash: (msg: string, ms?: number) => void, pref: DinnerPref | undefined) {
  const [planned, setPlanned] = usePersistentState<PlannedMeal[]>("planned", () => [], (saved) => upgradePlanned(saved, pref, new Date()));

  function plan(match: RecipeMatch, time: TimeOfDay) {
    const now = new Date();
    const dinnerAt = nextDinner(now, time);
    const steps = thawSchedule(match, dinnerAt);
    const next = planMeal(planned, match.recipe.id, dinnerAt);
    // When everything is already due the message below says so, so the "time to take it out" alert would only repeat it.
    const allDue = steps.length > 0 && steps.every((s) => s.outAt.getTime() <= now.getTime());
    setPlanned(allDue ? markAlerted(next, match.recipe.id) : next);
    if (steps.length === 0) return flash(`Planned ${match.recipe.title} for ${formatTime(time)}. Nothing in the freezer to thaw.`, 3500);
    const { title, body } = thawMessage(match.recipe.title, steps, now);
    flash(`${title}. ${body}`, 6000);
    void showNotification(title, body);
  }

  return {
    planned,
    isPlanned: (id: string) => isPlanned(planned, id),
    plan,
    unplan: (id: string) => setPlanned((p) => p.filter((x) => x.id !== id)),
    markAlerted: (id: string) => setPlanned((p) => markAlerted(p, id)),
  };
}
