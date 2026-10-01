import { describe, expect, it } from "vitest";
import { fitsDiets, usesAvoided, type DietId } from "@/lib/diets";
import { RECIPES } from "@/data/recipes";

const dish = (...ingredients: string[]) => ({
  id: "x", title: "X", minutes: 10, servings: 2, tags: [], steps: [],
  ingredients: ingredients.map((i) => ({ name: i.replace("?", ""), optional: i.endsWith("?") || undefined })),
});
const fits = (diet: DietId, ...ingredients: string[]) => fitsDiets(dish(...ingredients), [diet]);

describe("fitsDiets", () => {
  it("vegetarian keeps eggs and dairy but drops meat, fish and meat broth", () => {
    expect(fits("vegetarian", "egg", "cheddar", "spinach")).toBe(true);
    for (const n of ["chicken", "bacon", "shrimp", "fish sauce", "beef broth"]) expect(fits("vegetarian", "rice", n)).toBe(false);
  });

  it("pescatarian allows fish but not meat", () => {
    expect(fits("pescatarian", "salmon", "rice")).toBe(true);
    expect(fits("pescatarian", "ground beef")).toBe(false);
  });

  it("vegan drops dairy, egg and honey but keeps coconut milk and peanut butter", () => {
    for (const n of ["milk", "butter", "egg", "honey", "parmesan", "mayonnaise"]) expect(fits("vegan", n)).toBe(false);
    expect(fits("vegan", "coconut milk", "peanut butter", "rice")).toBe(true);
  });

  it("gluten free drops wheat foods and soy sauce but keeps rice and tapioca flour", () => {
    for (const n of ["pasta", "flour", "tortilla", "soy sauce", "ramen noodles", "baguette", "spring roll wrapper"]) expect(fits("gluten-free", n)).toBe(false);
    expect(fits("gluten-free", "rice", "tapioca flour", "rice noodles")).toBe(false);
    expect(fits("gluten-free", "rice", "tapioca flour")).toBe(true);
  });

  it("keto drops grains, sugar and starches; paleo drops beans and dairy", () => {
    for (const n of ["rice", "sugar", "potato", "black beans"]) expect(fits("keto", n)).toBe(false);
    expect(fits("keto", "chicken", "spinach", "olive oil", "rice vinegar")).toBe(true);
    expect(fits("paleo", "chickpea")).toBe(false);
    expect(fits("paleo", "cheddar")).toBe(false);
    expect(fits("paleo", "honey", "chicken", "sweet potato")).toBe(true);
  });

  it("nut free catches peanut butter even though dairy free ignores it", () => {
    expect(fits("nut-free", "peanut butter")).toBe(false);
    expect(fits("dairy-free", "peanut butter", "coconut milk")).toBe(true);
  });

  it("halal/kosher drops pork, shellfish and alcohol only", () => {
    for (const n of ["pork chop", "bacon", "shrimp", "red wine"]) expect(fits("halal-kosher", n)).toBe(false);
    expect(fits("halal-kosher", "chicken", "cheddar")).toBe(true);
  });

  it("ignores optional ingredients and needs every chosen diet to fit", () => {
    expect(fits("vegetarian", "rice", "chorizo?")).toBe(true);
    expect(fitsDiets(dish("rice", "cheddar"), ["vegetarian", "dairy-free"])).toBe(false);
  });

  it("whole words only: eggplant is not an egg", () => {
    expect(fits("vegan", "eggplant")).toBe(true);
  });
});

describe("the real dishes", () => {
  it("leaves some dishes for each diet, and fewer for stricter ones", () => {
    const count = (d: DietId) => RECIPES.filter((r) => fitsDiets(r, [d])).length;
    for (const d of ["vegetarian", "vegan", "gluten-free", "keto", "paleo"] as DietId[]) expect(count(d)).toBeGreaterThan(0);
    expect(count("vegan")).toBeLessThan(count("vegetarian"));
    expect(count("vegetarian")).toBeLessThan(RECIPES.length);
  });
});

describe("usesAvoided", () => {
  it("matches whole words and plurals, and counts optional ingredients", () => {
    expect(usesAvoided(dish("peanut butter", "rice"), ["peanut"])).toBe(true);
    expect(usesAvoided(dish("rice", "cilantro?"), ["cilantro"])).toBe(true);
    expect(usesAvoided(dish("eggplant"), ["egg"])).toBe(false);
    expect(usesAvoided(dish("rice"), [])).toBe(false);
  });

  it("copes with characters that mean something in a pattern", () => {
    expect(usesAvoided(dish("rice"), ["c++", "(a"])).toBe(false);
  });
});
