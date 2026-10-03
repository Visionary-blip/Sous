import { describe, expect, it } from "vitest";
import { bubbleColor } from "@/lib/bubble-colors";
import { DIET_IDS } from "@/lib/diets";

describe("bubbleColor", () => {
  it("gives the same colour every time for the same id", () => {
    expect(bubbleColor("vegan")).toBe(bubbleColor("vegan"));
  });

  it("returns a hex colour and uses several colours across the diets", () => {
    const colours = DIET_IDS.map(bubbleColor);
    expect(colours.every((c) => /^#[0-9a-f]{6}$/.test(c))).toBe(true);
    expect(new Set(colours).size).toBeGreaterThanOrEqual(4);
  });
});
