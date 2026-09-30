import { describe, expect, it } from "vitest";
import { homeShelves } from "@/lib/home-shelves";
import { matchAll } from "@/lib/match";
import type { GroceryItem, Recipe } from "@/types";

const today = new Date(2026, 8, 30);

function recipe(id: string, ingredients: string[]): Recipe {
  return { id, title: id, minutes: 10, servings: 2, tags: [], ingredients: ingredients.map((name) => ({ name })), steps: [] };
}

function grocery(name: string, expiresOn?: string): GroceryItem {
  return { id: name, name, group: "Other", expiresOn, addedOn: "2026-09-29" };
}

const RECIPES = [
  recipe("soon", ["spinach"]),
  recipe("ready", ["egg"]),
  recipe("almost", ["egg", "flour"]),
  recipe("far", ["egg", "a", "b", "c"]),
  recipe("unrelated", ["lamb"]),
];
const ranked = matchAll(RECIPES, [grocery("egg"), grocery("spinach", "2026-10-01")], [], today);

function shelfIds(classics = { liked: [] as string[], wish: [] as string[] }): Record<string, string[]> {
  return Object.fromEntries(homeShelves(ranked, classics).map((s) => [s.id, s.items.map((m) => m.recipe.id)]));
}

describe("homeShelves", () => {
  it("sorts recipes onto one kitchen shelf each and drops empty shelves", () => {
    expect(shelfIds()).toEqual({ "use-it-up": ["soon"], ready: ["ready"], almost: ["almost"] });
  });

  it("puts every recipe that uses expiring food on Use it up, even one needing a big shop", () => {
    const big = matchAll([recipe("big", ["spinach", "a", "b", "c", "d"])], [grocery("spinach", "2026-10-01")], [], today);
    expect(homeShelves(big, { liked: [], wish: [] }).map((s) => s.id)).toEqual(["use-it-up"]);
  });

  it("builds the Classics shelf from liked and wished recipes you nearly have", () => {
    const shelves = shelfIds({ liked: ["far"], wish: ["unrelated", "soon"] });
    expect(shelves.classics).toEqual(["far", "unrelated", "soon"]);
  });

  it("leaves out classics that need a big shop", () => {
    const withFar = matchAll([recipe("huge", ["egg", "a", "b", "c", "d"])], [grocery("egg")], [], today);
    expect(homeShelves(withFar, { liked: ["huge"], wish: [] })).toEqual([]);
  });

  it("returns no shelves for an empty pantry", () => {
    expect(homeShelves(matchAll(RECIPES, [], [], today).filter(() => true), { liked: [], wish: [] })).toEqual([]);
  });
});
