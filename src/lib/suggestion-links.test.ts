import { describe, expect, it } from "vitest";
import { suggestionLinks } from "@/lib/suggestion-links";

describe("suggestionLinks", () => {
  it("makes one search link per site, labelled with the dish", () => {
    const links = suggestionLinks("Fluffy Pancakes");
    expect(links.map((l) => l.label)).toContain("Fluffy Pancakes on Allrecipes");
    expect(links.every((l) => l.url.startsWith("https://"))).toBe(true);
  });

  it("offers the listed sites, with Serious Eats and Google left out", () => {
    const labels = suggestionLinks("Paella").map((l) => l.label);
    expect(labels).toEqual(["Allrecipes", "BBC Good Food", "Epicurious", "Budget Bytes", "RecipeTin Eats", "Delish", "King Arthur Baking", "NYT Cooking"].map((s) => `Paella on ${s}`));
    expect(suggestionLinks("Paella").at(-1)?.url).toBe("https://cooking.nytimes.com/search?q=Paella");
  });

  it("encodes characters that would break a web address", () => {
    const [first] = suggestionLinks("Mac & Cheese");
    expect(first.url).toBe("https://www.allrecipes.com/search?q=Mac%20%26%20Cheese");
  });
});
