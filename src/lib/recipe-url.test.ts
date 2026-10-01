import { describe, expect, it } from "vitest";
import { isPublicHttpUrl } from "@/lib/recipe-url";

describe("isPublicHttpUrl", () => {
  it("accepts ordinary web addresses", () => {
    expect(isPublicHttpUrl("https://www.bbcgoodfood.com/recipes/easy-pancakes")).toBe(true);
  });

  it("rejects local and private addresses, and other schemes", () => {
    for (const u of ["http://localhost:5173/", "http://127.0.0.1/", "http://192.168.1.5/", "http://10.0.0.2/", "http://172.20.0.1/", "http://[::1]/", "file:///etc/passwd", "nonsense"]) {
      expect(isPublicHttpUrl(u)).toBe(false);
    }
  });
});
