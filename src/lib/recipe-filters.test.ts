import { describe, expect, it } from "vitest";
import { matchAll } from "@/lib/match";
import { filterMatches, frontPicks } from "@/lib/recipe-filters";
import type { GroceryItem, Recipe } from "@/types";

const today = new Date(2026, 8, 29);

function recipe(id: string, minutes: number, ingredients: string[]): Recipe {
  return {
    id,
    title: `Dish ${id}`,
    minutes,
    servings: 2,
    tags: ["dinner"],
    ingredients: ingredients.map((name) => ({ name })),
    steps: [],
  };
}

function grocery(name: string, expiresOn?: string): GroceryItem {
  return { id: name, name, group: "Other", expiresOn, addedOn: "2026-09-28" };
}

const RECIPES: Recipe[] = [
  recipe("ready", 15, ["egg"]),
  recipe("soon", 40, ["spinach", "feta"]),
  recipe("far", 30, ["egg", "flour", "sugar", "butter"]),
  recipe("unrelated", 10, ["lamb"]),
];
const GROCERIES = [grocery("egg"), grocery("spinach", "2026-09-30")];

function rank() {
  return matchAll(RECIPES, GROCERIES, [], today);
}

function ids(list: { recipe: Recipe }[]): string[] {
  return list.map((m) => m.recipe.id);
}

describe("filterMatches", () => {
  it("keeps everything when no chip or query is set", () => {
    expect(filterMatches(rank(), "  ", [])).toHaveLength(4);
  });

  it("filters by each chip", () => {
    expect(ids(filterMatches(rank(), "", ["ready"]))).toEqual(["ready"]);
    expect(ids(filterMatches(rank(), "", ["use-up"]))).toEqual(["soon"]);
    expect(ids(filterMatches(rank(), "", ["almost"])).sort()).toEqual(["soon", "unrelated"]);
    expect(ids(filterMatches(rank(), "", ["quick"])).sort()).toEqual(["ready", "unrelated"]);
  });

  it("combines chips with AND and searches title and ingredients", () => {
    expect(filterMatches(rank(), "", ["ready", "use-up"])).toEqual([]);
    expect(ids(filterMatches(rank(), "FETA", []))).toEqual(["soon"]);
  });
});

describe("frontPicks", () => {
  it("puts food about to expire first, then what is ready", () => {
    const ranked = rank().filter((m) => m.usesGroceries.length > 0);
    expect(ids(frontPicks(ranked))).toEqual(["soon", "ready", "far"]);
  });

  it("caps the shelf at the count", () => {
    expect(frontPicks(rank(), 2)).toHaveLength(2);
  });

  it("skips an expiring recipe that needs a big shop and falls back to the closest", () => {
    const ranked = matchAll([recipe("big", 30, ["spinach", "a", "b", "c"])], GROCERIES, [], today);
    expect(ids(frontPicks(ranked))).toEqual(["big"]);
  });
});
