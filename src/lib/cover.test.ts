import { describe, expect, it } from "vitest";
import { coverBackground, coverColor, coverInk, mealOf } from "@/lib/cover";
import { RECIPES } from "@/data/recipes";
import type { Recipe } from "@/types";

function tagged(...tags: string[]): Recipe {
  return { id: "x", title: "x", minutes: 1, servings: 1, tags, ingredients: [], steps: [] };
}

describe("mealOf", () => {
  it("uses the earliest meal in the day when several are tagged", () => {
    expect(mealOf(tagged("lunch", "dinner"))).toBe("lunch");
    expect(mealOf(tagged("dinner", "breakfast"))).toBe("breakfast");
  });

  it("treats sides as snacks and dessert as its own meal", () => {
    expect(mealOf(tagged("side", "vegan"))).toBe("snack");
    expect(mealOf(tagged("dessert", "baking"))).toBe("dessert");
    expect(mealOf(tagged("dessert", "dinner"))).toBe("dinner");
  });

  it("gives every built-in recipe one of the five meals", () => {
    const meals = new Set(RECIPES.map(mealOf));
    expect([...meals].sort()).toEqual(["breakfast", "dessert", "dinner", "lunch", "snack"]);
  });
});

describe("coverColor", () => {
  it("is one solid colour, not a gradient", () => {
    expect(coverColor(tagged("dinner"))).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("shares one colour across a meal", () => {
    expect(coverColor(tagged("breakfast", "eggs"))).toEqual(coverColor(tagged("breakfast", "quick")));
    expect(coverColor(tagged("lunch"))).not.toEqual(coverColor(tagged("dinner")));
  });
});

describe("coverInk", () => {
  it("is dark on the light snack blue and white elsewhere", () => {
    expect(coverInk(tagged("side"))).not.toBe("#ffffff");
    expect(coverInk(tagged("dinner"))).toBe("#ffffff");
  });
});

describe("coverBackground", () => {
  it("fades from slightly darkened up to the solid meal colour, upward", () => {
    const css = coverBackground(tagged("dinner"));
    expect(css).toContain("to top");
    expect(css).toContain("black");
    expect(css.endsWith(`${coverColor(tagged("dinner"))})`)).toBe(true);
  });
});
