import { describe, expect, it } from "vitest";
import { storeLinks } from "@/lib/grocery-stores";

describe("storeLinks", () => {
  it("makes one search link per store with the item encoded", () => {
    const links = storeLinks("cream cheese");
    expect(links.map((l) => l.label)).toEqual(["Instacart", "Walmart", "Target", "Amazon Fresh", "Whole Foods"]);
    expect(links[1].url).toBe("https://www.walmart.com/search?q=cream%20cheese");
    expect(links.every((l) => l.url.startsWith("https://"))).toBe(true);
  });

  it("with Organic on, asks for organic, puts organic-focused stores first and adds Thrive Market", () => {
    const links = storeLinks("cream cheese", true);
    expect(links.map((l) => l.label)).toEqual(["Whole Foods", "Thrive Market", "Instacart", "Walmart", "Target", "Amazon Fresh"]);
    expect(links.filter((l) => l.organic).map((l) => l.label)).toEqual(["Whole Foods", "Thrive Market"]);
    expect(links[0].url).toBe("https://www.wholefoodsmarket.com/search?text=organic%20cream%20cheese");
  });

  it("with Organic off, nothing is marked organic", () => {
    expect(storeLinks("milk").some((l) => l.organic)).toBe(false);
  });
});
