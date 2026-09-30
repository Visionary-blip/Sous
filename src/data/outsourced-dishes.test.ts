import { describe, expect, it } from "vitest";
import { CUISINE_OF, CUISINES } from "@/data/cuisines";
import { OUTSOURCED_DISHES } from "@/data/outsourced-dishes";

describe("outsourced dishes", () => {
  it("has 76 dishes with unique ids and titles", () => {
    expect(OUTSOURCED_DISHES).toHaveLength(76);
    expect(new Set(OUTSOURCED_DISHES.map((d) => d.id)).size).toBe(76);
    expect(new Set(OUTSOURCED_DISHES.map((d) => d.title)).size).toBe(76);
  });

  it("gives every dish a flavour group and needs at least one required ingredient", () => {
    for (const d of OUTSOURCED_DISHES) {
      expect(CUISINE_OF[d.id], d.id).toBeDefined();
      expect(d.ingredients.some((i) => !i.endsWith("?")), d.id).toBe(true);
    }
  });

  it("fills every flavour group", () => {
    for (const c of CUISINES) expect(Object.values(CUISINE_OF)).toContain(c);
  });
});
