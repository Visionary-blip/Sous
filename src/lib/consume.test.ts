import { describe, expect, it } from "vitest";
import { consume } from "@/lib/consume";
import { matchRecipe } from "@/lib/match";
import type { GroceryItem, Recipe } from "@/types";

const today = new Date(2026, 8, 30);

function grocery(name: string, quantity?: string): GroceryItem {
  return { id: name, name, group: "Other", quantity, addedOn: "2026-09-29" };
}

const RECIPE: Recipe = {
  id: "r",
  title: "R",
  minutes: 10,
  servings: 2,
  tags: [],
  ingredients: [
    { name: "egg", amount: "3" },
    { name: "chicken", amount: "1.5 lb" },
    { name: "rice", amount: "1 cup" },
    { name: "spinach", amount: "a handful" },
    { name: "onion" },
  ],
  steps: [],
};

function run(groceries: GroceryItem[]) {
  return consume(matchRecipe(RECIPE, groceries, [], today));
}

describe("consume", () => {
  it("subtracts comparable amounts and removes what runs out", () => {
    const out = run([grocery("eggs", "12"), grocery("chicken thighs", "1.5 lb")]);
    expect(out.changes.map((c) => [c.item.name, c.left])).toEqual([["eggs", "9"], ["chicken thighs", null]]);
    expect(out.changes[0].used).toBe("3 eggs");
  });

  it("hands anything it can't compare to the person", () => {
    const out = run([grocery("rice", "2 bags"), grocery("spinach", "1 bag"), grocery("onion", "3"), grocery("eggs")]);
    expect(out.changes).toEqual([]);
    expect(out.unresolved.map((u) => [u.item.name, u.needed])).toEqual([
      ["eggs", "3"],
      ["rice", "1 cup"],
      ["spinach", "a handful"],
      ["onion", undefined],
    ]);
  });

  it("leaves staples and unmatched ingredients alone", () => {
    expect(run([])).toEqual({ changes: [], unresolved: [] });
  });
});
