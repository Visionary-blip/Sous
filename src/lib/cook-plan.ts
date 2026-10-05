import { dinnerTime, nextDinner, type DinnerPref } from "@/lib/dinner-time";

/** A meal the person said they will cook, with the dinner time it is aimed at. */
export interface PlannedMeal {
  id: string;
  /** ISO time of the dinner this plan is for, fixed when the pot was pressed. */
  dinnerAt: string;
  /** Set once the "time to take it out" alert has fired, so it fires once. */
  alerted?: boolean;
}

export function isPlanned(planned: PlannedMeal[], id: string): boolean {
  return planned.some((p) => p.id === id);
}

/** Plans a dish for the given dinner, replacing an earlier plan for it. */
export function planMeal(planned: PlannedMeal[], id: string, dinnerAt: Date): PlannedMeal[] {
  return [...planned.filter((p) => p.id !== id), { id, dinnerAt: dinnerAt.toISOString() }];
}

export function markAlerted(planned: PlannedMeal[], id: string): PlannedMeal[] {
  return planned.map((p) => (p.id === id ? { ...p, alerted: true } : p));
}

/** Plans saved before dinner times existed were bare ids; give them the next dinnertime. */
export function upgradePlanned(saved: (PlannedMeal | string)[], pref: DinnerPref | undefined, now: Date): PlannedMeal[] {
  return saved.map((p) => (typeof p === "string" ? { id: p, dinnerAt: nextDinner(now, dinnerTime(pref)).toISOString() } : p));
}
