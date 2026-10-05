import type { FoodGroup } from "@/types";

export interface TimeOfDay {
  hour: number;
  minute: number;
}

/** What the person chose in Settings: the assumed time, or their own. */
export interface DinnerPref {
  custom: boolean;
  hour: number;
  minute: number;
}

/** The assumed dinnertime when the person hasn't set their own. */
export const ASSUMED_DINNER: TimeOfDay = { hour: 18, minute: 0 };

export function dinnerTime(pref: DinnerPref | undefined): TimeOfDay {
  return pref?.custom ? { hour: pref.hour, minute: pref.minute } : ASSUMED_DINNER;
}

export function to12h(t: TimeOfDay): { hour12: number; minute: number; pm: boolean } {
  return { hour12: t.hour % 12 === 0 ? 12 : t.hour % 12, minute: t.minute, pm: t.hour >= 12 };
}

export function from12h(hour12: number, minute: number, pm: boolean): TimeOfDay {
  return { hour: (hour12 % 12) + (pm ? 12 : 0), minute };
}

/** "6:00 PM" */
export function formatTime(t: TimeOfDay): string {
  const { hour12, minute, pm } = to12h(t);
  return `${hour12}:${String(minute).padStart(2, "0")} ${pm ? "PM" : "AM"}`;
}

/** The next time the clock reads `t`: later today if it hasn't passed, otherwise tomorrow. */
export function nextDinner(now: Date, t: TimeOfDay): Date {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), t.hour, t.minute);
  return today.getTime() > now.getTime() ? today : new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, t.hour, t.minute);
}

/** Rough hours a frozen food needs to thaw in the fridge, from general rules of thumb (not food-safety advice). */
const THAW_RULES: { hours: number; words: string[] }[] = [
  { hours: 8, words: ["shrimp", "prawn", "scallop"] },
  { hours: 12, words: ["fish", "salmon", "cod", "tuna", "milk", "cream", "yogurt", "cheese", "butter"] },
  { hours: 24, words: ["chicken", "beef", "pork", "turkey", "lamb", "steak", "ground", "mince", "sausage", "bacon", "roast", "wings", "ham"] },
  { hours: 3, words: ["bread", "tortilla", "bagel"] },
];

const THAW_GROUP_DEFAULT: Record<FoodGroup, number> = {
  Protein: 24,
  Vegetables: 3,
  Fruit: 3,
  "Dairy & eggs": 12,
  "Grains & starches": 3,
  Other: 8,
};

export function thawHours(name: string, group: FoodGroup): number {
  const text = name.toLowerCase().replace(/[^a-z]+/g, " ");
  const rule = THAW_RULES.find((r) => r.words.some((w) => new RegExp(`\\b${w}s?\\b`).test(text)));
  return rule?.hours ?? THAW_GROUP_DEFAULT[group];
}

export function takeOutAt(dinnerAt: Date, hours: number): Date {
  return new Date(dinnerAt.getTime() - hours * 3_600_000);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** "now", "today 3:00 PM", "tomorrow 6:00 PM" or "Sat 6:00 PM". */
export function takeOutLabel(at: Date, now: Date): string {
  if (at.getTime() <= now.getTime()) return "now";
  const time = formatTime({ hour: at.getHours(), minute: at.getMinutes() });
  const days = Math.round((Date.UTC(at.getFullYear(), at.getMonth(), at.getDate()) - Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())) / 86_400_000);
  const day = days === 0 ? "today" : days === 1 ? "tomorrow" : WEEKDAYS[at.getDay()];
  return `${day} ${time}`;
}
