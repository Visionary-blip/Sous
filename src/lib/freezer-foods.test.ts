import { describe, expect, it } from "vitest";
import { RECIPES } from "@/data/recipes";
import { needsFreezerItems, typicallyFrozen } from "@/lib/freezer-foods";
import type { Recipe } from "@/types";

const dish = (...names: string[]): Recipe => ({
  id: "x", title: "X", minutes: 1, servings: 1, tags: [], steps: [],
  ingredients: names.map((n) => ({ name: n.replace("?", ""), optional: n.endsWith("?") || undefined })),
});

describe("typicallyFrozen", () => {
  it("knows meat, seafood and a few doughs, on whole words", () => {
    for (const n of ["chicken breast", "ground beef", "shrimp", "salmon", "bacon", "pizza dough", "bread"]) expect(typicallyFrozen(n), n).toBe(true);
    for (const n of ["spinach", "eggs", "rice", "eggplant", "hamburger bun", "milk"]) expect(typicallyFrozen(n), n).toBe(false);
  });
});

describe("needsFreezerItems", () => {
  it("needs a required ingredient people typically freeze; optional ones do not count", () => {
    expect(needsFreezerItems(dish("rice", "chicken"))).toBe(true);
    expect(needsFreezerItems(dish("rice", "bacon?"))).toBe(false);
    expect(needsFreezerItems(dish("rice", "spinach"))).toBe(false);
  });

  it("applies to some but not all real dishes", () => {
    const count = RECIPES.filter(needsFreezerItems).length;
    expect(count).toBeGreaterThan(10);
    expect(count).toBeLessThan(RECIPES.length);
  });
});
