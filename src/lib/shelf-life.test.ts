import { describe, expect, it } from "vitest";
import { addDaysIso, assumedExpiry, assumedShelfDays } from "@/lib/shelf-life";

describe("assumedShelfDays", () => {
  it("knows common foods", () => {
    expect(assumedShelfDays("Chicken thighs", "Protein")).toBe(2);
    expect(assumedShelfDays("eggs", "Dairy & eggs")).toBe(28);
    expect(assumedShelfDays("baby spinach", "Vegetables")).toBe(5);
    expect(assumedShelfDays("Milk", "Dairy & eggs")).toBe(7);
  });

  it("lets cooked, frozen and canned override the food", () => {
    expect(assumedShelfDays("cooked chicken", "Protein")).toBe(3);
    expect(assumedShelfDays("frozen spinach", "Vegetables")).toBe(90);
    expect(assumedShelfDays("canned tuna", "Protein")).toBe(365);
  });

  it("falls back to the food group when nothing matches", () => {
    expect(assumedShelfDays("mystery thing", "Vegetables")).toBe(7);
    expect(assumedShelfDays("mystery jar", "Other")).toBe(30);
  });

  it("matches whole words only", () => {
    expect(assumedShelfDays("eggplant", "Vegetables")).toBe(7);
  });
});

describe("addDaysIso", () => {
  it("adds days across month and year ends", () => {
    expect(addDaysIso("2026-10-30", 3)).toBe("2026-11-02");
    expect(addDaysIso("2026-12-30", 5)).toBe("2027-01-04");
  });

  it("builds the assumed date from the item", () => {
    expect(assumedExpiry("milk", "Dairy & eggs", "2026-10-01")).toBe("2026-10-08");
  });
});
