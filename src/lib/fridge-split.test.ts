import { describe, expect, it } from "vitest";
import { matchAll } from "@/lib/match";
import { splitByFridge } from "@/lib/recipe-filters";
import type { GroceryItem, Recipe } from "@/types";

const today = new Date(2026, 8, 30);

function recipe(id: string, ingredients: string[]): Recipe {
  return { id, title: id, minutes: 10, servings: 2, tags: [], ingredients: ingredients.map((name) => ({ name })), steps: [] };
}

function grocery(name: string): GroceryItem {
  return { id: name, name, group: "Other", addedOn: "2026-09-29" };
}

const RECIPES = [recipe("two", ["egg", "spinach", "feta"]), recipe("one", ["egg", "lamb"]), recipe("none", ["lamb"]), recipe("three", ["egg", "spinach", "milk"])];
const matches = matchAll(RECIPES, [grocery("egg"), grocery("spinach"), grocery("milk")], [], today);

describe("splitByFridge", () => {
  it("puts dishes using 2 or more fridge items first and the rest after, each in input order", () => {
    const { fromFridge, others } = splitByFridge(matches);
    expect(fromFridge.map((m) => m.recipe.id).sort()).toEqual(["three", "two"]);
    expect(others.map((m) => m.recipe.id).sort()).toEqual(["none", "one"]);
  });

  it("counts only groceries, not staples or assumed items", () => {
    const withSalt = matchAll([recipe("a", ["egg", "salt", "water"])], [grocery("egg")], [], today);
    expect(splitByFridge(withSalt).fromFridge).toEqual([]);
  });

  it("puts everything in the second list when the fridge is empty", () => {
    const empty = matchAll(RECIPES, [], [], today);
    expect(splitByFridge(empty).fromFridge).toEqual([]);
    expect(splitByFridge(empty).others).toHaveLength(RECIPES.length);
  });
});
