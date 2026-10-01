/** "Serves 4", or "Serves 2 · small for 4" when the dish feeds fewer people than the household. */
export function servingsNote(servings: number, household: number | undefined): string {
  const base = `Serves ${servings}`;
  return household && servings < household ? `${base} · small for ${household}` : base;
}

export const MIN_HOUSEHOLD = 1;
export const MAX_HOUSEHOLD = 12;

/** A whole number from 1 to 12, or undefined for blank or nonsense (meaning "not set"). */
export function parseHousehold(raw: string): number | undefined {
  const n = Number(raw);
  return Number.isInteger(n) && n >= MIN_HOUSEHOLD && n <= MAX_HOUSEHOLD ? n : undefined;
}
