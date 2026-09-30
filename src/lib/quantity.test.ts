import { describe, expect, it } from "vitest";
import { parseAmount, subtract } from "@/lib/quantity";

describe("parseAmount", () => {
  it("reads numbers, fractions and mixed numbers", () => {
    expect(parseAmount("1.5 lb")?.value).toBe(1.5);
    expect(parseAmount("1/4 cup")?.value).toBe(0.25);
    expect(parseAmount("1 1/2 cups")?.value).toBe(1.5);
    expect(parseAmount("1 lb, sliced")?.value).toBe(1);
  });

  it("gives up on words with no number", () => {
    for (const t of ["to taste", "a pinch", "for serving", "", undefined]) expect(parseAmount(t)).toBeNull();
  });
});

describe("subtract", () => {
  it("subtracts bare counts", () => {
    expect(subtract("6", "2")).toEqual({ kind: "left", quantity: "4" });
    expect(subtract("6 eggs", "3")).toEqual({ kind: "left", quantity: "3" });
  });

  it("converts within weight and within volume, answering in the pantry's unit", () => {
    expect(subtract("2 lb", "8 oz")).toEqual({ kind: "left", quantity: "1.5 lb" });
    expect(subtract("1 cup", "4 tbsp")).toEqual({ kind: "left", quantity: "0.75 cup" });
  });

  it("says gone when nothing or less is left", () => {
    expect(subtract("2", "2")).toEqual({ kind: "gone" });
    expect(subtract("2 lb", "500 g")).toEqual({ kind: "left", quantity: "0.9 lb" });
    expect(subtract("8 oz", "1 lb")).toEqual({ kind: "gone" });
  });

  it("refuses to compare different kinds of thing", () => {
    expect(subtract("2", "1 cup")).toBeNull();
    expect(subtract("1 head", "3 cloves")).toBeNull();
    expect(subtract("1 bag", "1")).toBeNull();
    expect(subtract("1 lb", "1 cup")).toBeNull();
    expect(subtract(undefined, "1")).toBeNull();
    expect(subtract("a bag", "1")).toBeNull();
    expect(subtract("2", "to taste")).toBeNull();
  });

  it("matches cloves with cloves", () => {
    expect(subtract("10 cloves", "3 cloves")).toEqual({ kind: "left", quantity: "7 cloves" });
  });
});
