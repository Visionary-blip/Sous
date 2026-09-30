import { describe, expect, it } from "vitest";
import { RECIPES } from "@/data/recipes";
import { matchAll } from "@/lib/match";
import { sortByTitle } from "@/lib/recipe-filters";

describe("sortByTitle", () => {
  const all = matchAll(RECIPES, [], [], new Date(2026, 8, 30));

  it("orders titles A to Z regardless of how well they match the kitchen", () => {
    const titles = sortByTitle(all).map((m) => m.recipe.title);
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" })));
    expect(titles[0]).toBe("Apple Pie");
  });

  it("leaves the input order alone", () => {
    const before = all.map((m) => m.recipe.id);
    sortByTitle(all);
    expect(all.map((m) => m.recipe.id)).toEqual(before);
  });

  it("has unique ids across built-in and outsourced dishes", () => {
    const ids = RECIPES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
