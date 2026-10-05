import { addDaysIso } from "@/lib/shelf-life";
import { takeOutAt, takeOutLabel, thawHours } from "@/lib/dinner-time";
import type { RecipeMatch } from "@/lib/match";
import type { GroceryItem } from "@/types";

/** Frozen groceries that a dish needs: required ingredients whose only source is something in the freezer. */
export function thawNeeded(match: RecipeMatch): GroceryItem[] {
  const frozen = match.ingredients
    .filter((i) => !i.ingredient.optional && i.source?.kind === "grocery" && i.source.item.frozen)
    .map((i) => (i.source?.kind === "grocery" ? i.source.item : null));
  return frozen.filter((g, n): g is GroceryItem => g !== null && frozen.indexOf(g) === n);
}

export interface ThawStep {
  item: GroceryItem;
  hours: number;
  /** When to take it out of the freezer to be thawed by dinner. */
  outAt: Date;
}

/** For each frozen item a dish needs: how long it takes to thaw and when to take it out, earliest first. */
export function thawSchedule(match: RecipeMatch, dinnerAt: Date): ThawStep[] {
  return thawNeeded(match)
    .map((item) => {
      const hours = thawHours(item.name, item.group);
      return { item, hours, outAt: takeOutAt(dinnerAt, hours) };
    })
    .sort((a, b) => a.outAt.getTime() - b.outAt.getTime());
}

/** "chicken breast by tomorrow 6:00 PM, shrimp by tomorrow 10:00 AM" */
export function thawLine(steps: ThawStep[], now: Date): string {
  return steps.map((s) => `${s.item.name} ${s.outAt.getTime() <= now.getTime() ? "now" : `by ${takeOutLabel(s.outAt, now)}`}`).join(", ");
}

export function thawMessage(dish: string, steps: ThawStep[], now: Date): { title: string; body: string } {
  return { title: `Thaw for ${dish}`, body: `Take out: ${thawLine(steps, now)}.` };
}

/** True once any of the steps is due (its take-out time has arrived). */
export function anyDue(steps: ThawStep[], now: Date): boolean {
  return steps.some((s) => s.outAt.getTime() <= now.getTime());
}

/** Thawed meat and fish should be used soon, so an item taken out of the freezer gets this many days. */
export const THAWED_DAYS = 2;

/** "It's out": the items leave the freezer and join the fridge with a short, estimated use-by date. */
export function thawedOut(groceries: GroceryItem[], ids: string[], todayIso: string): GroceryItem[] {
  return groceries.map((g) =>
    ids.includes(g.id) ? { ...g, frozen: undefined, expiresOn: addDaysIso(todayIso, THAWED_DAYS), expiryEstimated: true } : g,
  );
}
