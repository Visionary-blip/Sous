import { describe, expect, it } from "vitest";
import { extractRecipe, minutesFromDuration, shortenStep } from "@/lib/parse-recipe";

const page = (json: unknown) => `<html><script type="application/ld+json">${JSON.stringify(json)}</script></html>`;
const RECIPE = {
  "@type": "Recipe",
  name: "John&#39;s Pancakes",
  totalTime: "PT1H30M",
  recipeIngredient: ["2 cups flour", "1 &amp; 1/2 cups milk"],
  recipeInstructions: [
    { "@type": "HowToStep", text: "Whisk it all. Then rest the batter for ten minutes while the pan heats up properly on a high flame." },
    { "@type": "HowToSection", itemListElement: [{ "@type": "HowToStep", text: "Fry." }] },
  ],
};

describe("extractRecipe", () => {
  it("reads title, time, ingredients and steps, and cleans entities", () => {
    const r = extractRecipe(page(RECIPE), "https://www.example.com/p");
    expect(r?.title).toBe("John's Pancakes");
    expect(r?.minutes).toBe(90);
    expect(r?.source).toBe("example.com");
    expect(r?.ingredients).toEqual(["2 cups flour", "1 & 1/2 cups milk"]);
    expect(r?.steps).toHaveLength(2);
  });

  it("finds a recipe inside @graph", () => {
    expect(extractRecipe(page({ "@graph": [{ "@type": "WebSite" }, RECIPE] }), "https://a.com/")?.steps.length).toBe(2);
  });

  it("returns null with no recipe, or a recipe missing steps", () => {
    expect(extractRecipe("<html></html>", "https://a.com/")).toBeNull();
    expect(extractRecipe(page({ ...RECIPE, recipeInstructions: [] }), "https://a.com/")).toBeNull();
  });
});

describe("shortenStep", () => {
  it("keeps the first sentence when two would run long", () => {
    expect(shortenStep("Whisk it all. Then rest the batter for ten minutes.", 20)).toBe("Whisk it all.");
  });

  it("keeps two short sentences", () => {
    expect(shortenStep("Bake. 25 minutes.")).toBe("Bake. 25 minutes.");
  });

  it("cuts one very long sentence at a word and adds an ellipsis", () => {
    expect(shortenStep("one two three four five six", 15)).toBe("one two three…");
  });
});

describe("minutesFromDuration", () => {
  it("reads hours and minutes, and gives null for junk", () => {
    expect(minutesFromDuration("PT45M")).toBe(45);
    expect(minutesFromDuration("PT2H")).toBe(120);
    expect(minutesFromDuration("soon")).toBeNull();
  });
});
