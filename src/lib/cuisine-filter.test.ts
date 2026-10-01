import { describe, expect, it } from "vitest";
import { CUISINE_OF, CUISINES } from "@/data/cuisines";
import { RECIPES } from "@/data/recipes";
import { matchAll } from "@/lib/match";
import { filterMatches } from "@/lib/recipe-filters";

const all = matchAll(RECIPES, [], [], new Date(2026, 8, 30));
const titles = (cuisines: Parameters<typeof filterMatches>[3]) => filterMatches(all, "", [], cuisines).map((m) => m.recipe.title);

describe("cuisine filter", () => {
  it("shows everything when no cuisine is on", () => {
    expect(filterMatches(all, "", [], [])).toHaveLength(RECIPES.length);
  });

  it("keeps only recipes of the chosen cuisine", () => {
    expect(titles(["Latin"])).toContain("Spaghetti Aglio e Olio");
    expect(titles(["Latin"])).not.toContain("Smash Burgers");
  });

  it("combines cuisines with OR and with the other chips with AND", () => {
    expect(titles(["Northern Europe", "American South"])).toEqual(expect.arrayContaining(["BBQ Meatballs", "Fish & Chips", "Swedish Meatballs", "Jambalaya", "Bangers & Mash"]));
    expect(titles(["Northern Europe", "American South"])).not.toContain("Paella");
    expect(filterMatches(all, "", ["ready"], ["Asia"])).toEqual([]);
  });

  it("groups Asian dishes together, curries and sushi included", () => {
    const asia = titles(["Asia"]);
    for (const t of ["Sushi Rolls", "Sushi Bake", "Japanese Curry", "Butter Chicken", "Fried Rice"]) expect(asia).toContain(t);
  });

  it("puts Thai and Vietnamese dishes under Southeast Asia, not Asia", () => {
    expect(titles(["Southeast Asia"])).toEqual(expect.arrayContaining(["Thai Green Curry", "Pad Thai", "Chicken Pho"]));
    expect(titles(["Asia"])).not.toContain("Pad Thai");
  });

  it("puts Mexican dishes under Central America and poutine under American", () => {
    expect(titles(["Central America"])).toContain("Ground Beef Tacos");
    expect(titles(["American"])).toContain("Poutine");
  });

  it("has South American dishes", () => {
    expect(titles(["South America"])).toEqual(expect.arrayContaining(["Arroz con Pollo", "Ceviche", "Lomo Saltado"]));
  });

  it("only points at recipes that exist and at listed cuisines", () => {
    const ids = new Set(RECIPES.map((r) => r.id));
    for (const [id, cuisine] of Object.entries(CUISINE_OF)) {
      expect(ids.has(id)).toBe(true);
      expect(CUISINES).toContain(cuisine);
    }
  });
});
