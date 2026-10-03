import { describe, expect, it } from "vitest";
import { isAllowedRecipeUrl } from "@api/recipe";

describe("isAllowedRecipeUrl", () => {
  it("accepts listed recipe sites and their subdomains", () => {
    expect(isAllowedRecipeUrl("https://www.bbcgoodfood.com/recipes/easy-pancakes")).toBe(true);
    expect(isAllowedRecipeUrl("https://cooking.nytimes.com/recipes/1")).toBe(true);
    expect(isAllowedRecipeUrl("https://recipetineats.com/lasagna/")).toBe(true);
  });

  it("refuses unlisted sites, lookalike names, local addresses and other schemes", () => {
    for (const u of ["https://example.com/", "https://notbbcgoodfood.com/", "https://bbcgoodfood.com.evil.com/", "https://www.nytimes.com/", "http://localhost:5173/", "http://127.0.0.1/", "http://192.168.1.5/", "file:///etc/passwd", "nonsense"]) {
      expect(isAllowedRecipeUrl(u), u).toBe(false);
    }
  });
});
