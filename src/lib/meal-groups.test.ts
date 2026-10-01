import { describe, expect, it } from "vitest";
import { RECIPES } from "@/data/recipes";
import { groupByTimeOfDay } from "@/lib/meal-groups";
import { matchAll } from "@/lib/match";

const all = matchAll(RECIPES, [], [], new Date(2026, 8, 30));

describe("groupByTimeOfDay", () => {
  it("orders the groups Morning, Noon, Night, Snacks, Dessert", () => {
    expect(groupByTimeOfDay(all).map((g) => g.label)).toEqual(["Morning", "Noon", "Night", "Snacks", "Dessert"]);
  });

  it("puts every recipe in exactly one group, with snacks and dessert in their own", () => {
    const groups = groupByTimeOfDay(all);
    expect(groups.flatMap((g) => g.items)).toHaveLength(RECIPES.length);
    const tagsIn = (id: string) => groups.find((g) => g.id === id)?.items.map((m) => m.recipe.tags.join(" ")) ?? [];
    expect(tagsIn("snacks").some((t) => t.includes("side"))).toBe(true);
    expect(tagsIn("dessert").every((t) => t.includes("dessert"))).toBe(true);
    expect(tagsIn("night").some((t) => t.includes("dessert"))).toBe(false);
  });

  it("drops empty groups", () => {
    const dinnerOnly = all.filter((m) => m.recipe.tags.includes("dinner") && !m.recipe.tags.includes("lunch") && !m.recipe.tags.includes("breakfast"));
    expect(groupByTimeOfDay(dinnerOnly).map((g) => g.id)).toEqual(["night"]);
  });
});
