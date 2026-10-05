import { describe, expect, it } from "vitest";
import { assumedFrozenDays, assumedFrozenExpiry, assumedShelfDays } from "@/lib/shelf-life";

describe("assumedFrozenDays", () => {
  it("gives frozen food a far longer life than the fridge", () => {
    for (const [name, group] of [["chicken thighs", "Protein"], ["spinach", "Vegetables"], ["milk", "Dairy & eggs"]] as const) {
      expect(assumedFrozenDays(name, group)).toBeGreaterThan(assumedShelfDays(name, group) * 5);
    }
  });

  it("uses shorter times for ground meat, bread and leftovers, and the group default otherwise", () => {
    expect(assumedFrozenDays("ground beef", "Protein")).toBe(120);
    expect(assumedFrozenDays("bread", "Grains & starches")).toBe(90);
    expect(assumedFrozenDays("chicken thighs", "Protein")).toBe(180);
  });

  it("builds the date from the day it is frozen", () => {
    expect(assumedFrozenExpiry("chicken thighs", "Protein", "2026-10-04")).toBe("2027-04-02");
  });
});
