import { describe, expect, it } from "vitest";
import { makeSnowflakes } from "@/lib/snowflakes";

describe("makeSnowflakes", () => {
  it("makes the requested number with unique ids continuing from the first", () => {
    const flakes = makeSnowflakes(6, 10);
    expect(flakes).toHaveLength(6);
    expect(flakes.map((f) => f.id)).toEqual([10, 11, 12, 13, 14, 15]);
  });

  it("keeps every flake small, starting on the button and falling downward", () => {
    for (const rand of [() => 0, () => 0.5, () => 0.999]) {
      for (const f of makeSnowflakes(5, 0, rand)) {
        expect(f.left).toBeGreaterThanOrEqual(10);
        expect(f.left).toBeLessThanOrEqual(90);
        expect(f.dy).toBeGreaterThan(0);
        expect(f.size).toBeLessThanOrEqual(13);
        expect(f.ms).toBeLessThanOrEqual(1200);
      }
    }
  });
});
