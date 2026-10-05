import { describe, expect, it } from "vitest";
import { matchRecipe } from "@/lib/match";
import { thawMessage, thawNeeded } from "@/lib/thaw";
import { togglePlanned } from "@/lib/cook-plan";
import type { GroceryItem, Recipe } from "@/types";

const today = new Date(2026, 9, 4);
const item = (name: string, frozen = false): GroceryItem => ({ id: name, name, group: "Protein", expiresOn: "2027-01-01", frozen: frozen || undefined, addedOn: "2026-10-01" });
const dish: Recipe = {
  id: "d", title: "Garlic Chicken", minutes: 20, servings: 2, tags: ["dinner"], steps: [],
  ingredients: [{ name: "chicken" }, { name: "garlic" }, { name: "rice" }, { name: "parsley", optional: true }],
};

describe("thawNeeded", () => {
  it("lists required ingredients that only come from the freezer", () => {
    const m = matchRecipe(dish, [item("chicken", true), item("garlic"), item("rice", true), item("parsley", true)], [], today);
    expect(thawNeeded(m).map((g) => g.name)).toEqual(["chicken", "rice"]);
  });

  it("is empty when nothing frozen is needed", () => {
    expect(thawNeeded(matchRecipe(dish, [item("chicken"), item("garlic")], [], today))).toEqual([]);
  });

  it("ignores a frozen copy when a fridge copy of the same thing is due sooner", () => {
    const fridge = { ...item("chicken"), id: "f", expiresOn: "2026-10-06" };
    expect(thawNeeded(matchRecipe(dish, [item("chicken", true), fridge], [], today))).toEqual([]);
  });
});

describe("thawMessage and togglePlanned", () => {
  it("words the reminder for one or several items", () => {
    expect(thawMessage("Garlic Chicken", [item("chicken")])).toEqual({ title: "Thaw for Garlic Chicken", body: "chicken is in the freezer." });
    expect(thawMessage("X", [item("a"), item("b")]).body).toBe("a, b are in the freezer.");
  });

  it("plans a dish once and unplans it on a second press", () => {
    expect(togglePlanned([], "d")).toEqual(["d"]);
    expect(togglePlanned(["d"], "d")).toEqual([]);
  });
});
