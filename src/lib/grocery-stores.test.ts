import { describe, expect, it } from "vitest";
import { storeLinks } from "@/lib/grocery-stores";

describe("storeLinks", () => {
  it("makes one search link per store with the item encoded", () => {
    const links = storeLinks("cream cheese");
    expect(links.map((l) => l.label)).toEqual(["Instacart", "Walmart", "Target", "Amazon Fresh", "Whole Foods"]);
    expect(links[1].url).toBe("https://www.walmart.com/search?q=cream%20cheese");
    expect(links.every((l) => l.url.startsWith("https://"))).toBe(true);
  });
});
