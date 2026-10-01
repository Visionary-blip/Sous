import { describe, expect, it } from "vitest";
import { entriesForDish, removeRecipe, saveRecipe, type SavedRecipe } from "@/lib/saved-recipes";

const r = (dishId: string, url: string): SavedRecipe => ({ dishId, url, title: "T", source: "a.com", minutes: null, ingredients: ["x"], steps: ["y"] });
const SEEDS = [{ url: "https://a.com/1", label: "One · a.com" }];

describe("entriesForDish", () => {
  it("lists seeds first, unread until saved, then the owner's own", () => {
    const own = r("pancakes", "https://b.com/2");
    const rows = entriesForDish("pancakes", [own, r("pancakes", "https://a.com/1")], SEEDS);
    expect(rows.map((e) => e.url)).toEqual(["https://a.com/1", "https://b.com/2"]);
    expect(rows.map((e) => e.seeded)).toEqual([true, false]);
    expect(entriesForDish("pancakes", [], SEEDS)[0].recipe).toBeNull();
  });

  it("ignores recipes saved under another dish", () => {
    expect(entriesForDish("pancakes", [r("paella", "https://c.com/3")], [])).toEqual([]);
  });
});

describe("saveRecipe / removeRecipe", () => {
  it("replaces a repeat of the same link and removes by dish and link", () => {
    const once = saveRecipe([], r("pancakes", "https://a.com/1"));
    expect(saveRecipe(once, r("pancakes", "https://a.com/1"))).toHaveLength(1);
    expect(removeRecipe(once, "pancakes", "https://a.com/1")).toEqual([]);
  });
});
