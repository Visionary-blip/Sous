import { describe, expect, it } from "vitest";
import { suggestionLinks } from "@/lib/suggestion-links";

describe("suggestionLinks", () => {
  it("makes one search link per site, labelled with the dish", () => {
    const links = suggestionLinks("Fluffy Pancakes");
    expect(links.map((l) => l.label)).toContain("Fluffy Pancakes on Allrecipes");
    expect(links.every((l) => l.url.startsWith("https://"))).toBe(true);
  });

  it("offers Allrecipes, BBC Good Food and NYT Cooking, and nothing else", () => {
    expect(suggestionLinks("Paella").map((l) => l.label)).toEqual([
      "Paella on Allrecipes",
      "Paella on BBC Good Food",
      "Paella on NYT Cooking",
    ]);
    expect(suggestionLinks("Paella")[2].url).toBe("https://cooking.nytimes.com/search?q=Paella");
  });

  it("encodes characters that would break a web address", () => {
    const [first] = suggestionLinks("Mac & Cheese");
    expect(first.url).toBe("https://www.allrecipes.com/search?q=Mac%20%26%20Cheese");
  });
});
