/** Cool colours (blues, teals, violets) matching the app's navy palette; each bubble gets one. */
const COOL_PALETTE = ["#5eb8ff", "#4b8fe0", "#3fb8c4", "#8fd0ff", "#a78bfa", "#6c7bf0", "#4cc3b0", "#7aa2f7"];

/** A fixed, scattered-looking pick from the cool palette for a given id, so a bubble keeps its colour between visits. */
export function bubbleColor(id: string): string {
  const hash = [...id].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
  return COOL_PALETTE[hash % COOL_PALETTE.length];
}
