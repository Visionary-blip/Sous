import { describe, expect, it } from "vitest";
import { coverColors, mealOf } from "@/lib/cover";
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

  it("treats sides and baking as snacks", () => {
    expect(mealOf(tagged("side", "vegan"))).toBe("snack");
    expect(mealOf(tagged("baking"))).toBe("snack");
  });

  it("gives every built-in recipe one of the four meals", () => {
    const meals = new Set(RECIPES.map(mealOf));
    expect([...meals].sort()).toEqual(["breakfast", "dinner", "lunch", "snack"]);
  });
});

describe("coverColors", () => {
  it("shares one colour across a meal", () => {
    expect(coverColors(tagged("breakfast", "eggs"))).toEqual(coverColors(tagged("breakfast", "quick")));
    expect(coverColors(tagged("lunch"))).not.toEqual(coverColors(tagged("dinner")));
  });
});
