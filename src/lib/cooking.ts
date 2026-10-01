/** What the bottom cooking bar is following: which recipe, which step, and whether the last step is done. */
export interface Cooking {
  id: string;
  step: number;
  done: boolean;
}

/** Tapping a step in the method starts cooking there (or moves the bar if it is already on this recipe). */
export function jumpTo(id: string, step: number): Cooking {
  return { id, step, done: false };
}

/** Stepping past the last step finishes; stepping back from finished returns to the last step. */
export function stepBy(c: Cooking, delta: 1 | -1, total: number): Cooking {
  const last = Math.max(1, total) - 1;
  if (c.done) return delta < 0 ? { ...c, step: last, done: false } : c;
  if (delta > 0 && c.step >= last) return { ...c, done: true };
  return { ...c, step: Math.max(0, Math.min(last, c.step + delta)) };
}
