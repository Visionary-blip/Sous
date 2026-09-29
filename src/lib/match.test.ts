import { describe, expect, it } from "vitest";
import { RECIPES } from "../data/recipes";
import { starterStaples } from "../data/staples";
import type { GroceryItem, Recipe, Staple } from "../types";
import { normalize, satisfies } from "./ingredients";
import { daysUntil, matchRecipe, recommend } from "./match";

const today = new Date(2026, 8, 29); // Sep 29, 2026

function item(name: string, expiresOn?: string): GroceryItem {
  return { id: name, name, location: "fridge", expiresOn, addedOn: "2026-09-28" };
}

function staple(name: string, inStock = true): Staple {
  return { id: name, name, category: "Spices", inStock };
}

describe("normalize", () => {
  it("lowercases, singularizes and strips filler words", () => {
    expect(normalize("Eggs")).toBe("egg");
    expect(normalize("Fresh Tomatoes")).toBe("tomato");
    expect(normalize("Boneless skinless chicken breasts")).toBe("chicken breast");
    expect(normalize("Bay Leaves")).toBe("bay leaf");
  });

  it("applies synonyms", () => {
    expect(normalize("Green onions")).toBe("scallion");
    expect(normalize("Kosher salt")).toBe("salt");
    expect(normalize("2% milk")).toBe("milk");
    expect(normalize("Garbanzo beans")).toBe("chickpea");
  });
});

describe("satisfies", () => {
  it("matches more specific items to general recipe ingredients", () => {
    expect(satisfies("Chicken thighs", "chicken")).toBe(true);
    expect(satisfies("Low-sodium soy sauce", "soy sauce")).toBe(true);
    expect(satisfies("Red bell pepper", "bell pepper")).toBe(true);
    expect(satisfies("Canned black beans", "black beans")).toBe(true);
    expect(satisfies("Penne", "pasta")).toBe(true);
    expect(satisfies("Dijon mustard", "mustard")).toBe(true);
  });

  it("does not confuse an ingredient with a product made from it", () => {
    expect(satisfies("Garlic powder", "garlic")).toBe(false);
    expect(satisfies("Chicken broth", "chicken")).toBe(false);
    expect(satisfies("Tomato paste", "tomato")).toBe(false);
    expect(satisfies("Peanut butter", "butter")).toBe(false);
    expect(satisfies("Coconut milk", "milk")).toBe(false);
    expect(satisfies("Sweet potato", "potato")).toBe(false);
  });

  it("does not match a general item to a specific requirement", () => {
    expect(satisfies("Chicken", "chicken breast")).toBe(false);
    expect(satisfies("Rice", "arborio rice")).toBe(false);
    expect(satisfies("Black pepper", "bell pepper")).toBe(false);
  });
});

describe("daysUntil", () => {
  it("counts whole days", () => {
    expect(daysUntil("2026-09-29", today)).toBe(0);
    expect(daysUntil("2026-10-02", today)).toBe(3);
    expect(daysUntil("2026-09-27", today)).toBe(-2);
  });
});

const omelette: Recipe = {
  id: "t",
  title: "Test omelette",
  minutes: 10,
  servings: 1,
  tags: [],
  ingredients: [
    { name: "egg" },
    { name: "butter" },
    { name: "salt" },
    { name: "water" },
    { name: "cheddar", optional: true },
  ],
  steps: [],
};

describe("matchRecipe", () => {
  it("draws from groceries, staples and always-available items", () => {
    const m = matchRecipe(omelette, [item("Eggs")], [staple("Salt"), staple("Butter", false)], today);
    expect(m.requiredCount).toBe(4);
    expect(m.haveCount).toBe(3);
    expect(m.missing.map((i) => i.name)).toEqual(["butter"]);
    expect(m.ingredients.find((i) => i.ingredient.name === "cheddar")?.source).toBeNull();
  });

  it("ignores staples that are out of stock and optional ingredients", () => {
    const m = matchRecipe(omelette, [item("eggs"), item("butter")], [staple("Salt")], today);
    expect(m.missing).toEqual([]);
    expect(m.score).toBe(1);
  });

  it("flags groceries that are expiring soon", () => {
    const m = matchRecipe(omelette, [item("Eggs", "2026-09-30")], [], today);
    expect(m.usesExpiring.map((g) => g.name)).toEqual(["Eggs"]);
  });
});

describe("recommend", () => {
  it("puts fully cookable recipes first and drops recipes that use no groceries", () => {
    const groceries = [item("Eggs"), item("Milk"), item("Bread"), item("Butter")];
    const results = recommend(RECIPES, groceries, starterStaples(), today);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.usesGroceries.length > 0)).toBe(true);
    const top = results[0];
    expect(top.missing).toEqual([]);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].missing.length).toBeGreaterThanOrEqual(results[i - 1].missing.length);
    }
  });

  it("prefers recipes that use soon-to-expire items among equally complete ones", () => {
    const staples = [staple("Salt"), staple("Black pepper"), staple("Butter")];
    const a: Recipe = { ...omelette, id: "a", ingredients: [{ name: "spinach" }, { name: "salt" }] };
    const b: Recipe = { ...omelette, id: "b", ingredients: [{ name: "egg" }, { name: "salt" }] };
    const results = recommend([a, b], [item("Spinach"), item("Eggs", "2026-09-30")], staples, today);
    expect(results.map((r) => r.recipe.id)).toEqual(["b", "a"]);
  });
});

describe("recipe data", () => {
  it("has unique ids and non-empty steps", () => {
    const ids = RECIPES.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of RECIPES) {
      expect(r.steps.length).toBeGreaterThan(0);
      expect(r.ingredients.some((i) => !i.optional)).toBe(true);
    }
  });
});
