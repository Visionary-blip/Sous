import { describe, expect, it } from "vitest";
import type { GroceryItem } from "../types";
import { guessGroup, withGroups } from "./food-groups";

describe("guessGroup", () => {
  it.each([
    ["chicken thighs", "Protein"],
    ["Eggs", "Dairy & eggs"],
    ["whole milk", "Dairy & eggs"],
    ["baby spinach", "Vegetables"],
    ["Bananas", "Fruit"],
    ["spaghetti", "Grains & starches"],
    ["sweet potatoes", "Grains & starches"],
  ] as const)("puts %s in %s", (name, group) => {
    expect(guessGroup(name)).toBe(group);
  });

  it("lets a product form beat its base word", () => {
    expect(guessGroup("peanut butter")).toBe("Other");
    expect(guessGroup("chicken broth")).toBe("Other");
    expect(guessGroup("egg noodles")).toBe("Grains & starches");
  });

  it("matches whole words only", () => {
    expect(guessGroup("eggplant")).toBe("Vegetables");
    expect(guessGroup("pineapple")).toBe("Fruit");
  });

  it("falls back to Other", () => {
    expect(guessGroup("mystery jar")).toBe("Other");
    expect(guessGroup("")).toBe("Other");
  });
});

describe("withGroups", () => {
  it("guesses a group for items saved before groups existed, and keeps chosen ones", () => {
    const old = { id: "1", name: "eggs", addedOn: "2026-09-28" } as GroceryItem;
    const chosen: GroceryItem = { id: "2", name: "eggs", group: "Protein", addedOn: "2026-09-28" };
    expect(withGroups([old, chosen]).map((g) => g.group)).toEqual(["Dairy & eggs", "Protein"]);
  });
});
