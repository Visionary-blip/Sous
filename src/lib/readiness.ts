import type { RecipeMatch } from "@/lib/match";

export function readiness(m: RecipeMatch): { text: string; tone: string } {
  if (m.missing.length === 0) return { text: "Ready to cook", tone: "ok" };
  return { text: `Missing ${m.missing.length}`, tone: m.missing.length <= 2 ? "warn" : "muted" };
}
