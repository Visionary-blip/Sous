import { describe, expect, it } from "vitest";
import { suggestionLinks } from "@/lib/suggestion-links";

describe("suggestionLinks", () => {
  it("makes one search link per site, labelled with the dish", () => {
    const links = suggestionLinks("Fluffy Pancakes");
    expect(links.map((l) => l.label)).toContain("Fluffy Pancakes on Allrecipes");
    expect(links.every((l) => l.url.startsWith("https://"))).toBe(true);
  });

  it("encodes characters that would break a web address", () => {
    const [first] = suggestionLinks("Mac & Cheese");
    expect(first.url).toBe("https://www.allrecipes.com/search?q=Mac%20%26%20Cheese");
  });
});
