import { describe, expect, it } from "vitest";
import { jumpTo, stepBy } from "@/lib/cooking";

describe("jumpTo", () => {
  it("starts a recipe at the chosen step", () => {
    expect(jumpTo("a", 2)).toEqual({ id: "a", step: 2, done: false });
  });
});

describe("stepBy", () => {
  it("moves forward and back within the steps", () => {
    expect(stepBy(jumpTo("a", 0), 1, 3).step).toBe(1);
    expect(stepBy(jumpTo("a", 1), -1, 3).step).toBe(0);
  });

  it("does not go before the first step", () => {
    expect(stepBy(jumpTo("a", 0), -1, 3).step).toBe(0);
  });

  it("finishes after the last step and returns to it going back", () => {
    const done = stepBy(jumpTo("a", 2), 1, 3);
    expect(done.done).toBe(true);
    expect(stepBy(done, 1, 3)).toBe(done);
    expect(stepBy(done, -1, 3)).toEqual({ id: "a", step: 2, done: false });
  });

  it("treats a recipe with no steps as one step", () => {
    expect(stepBy(jumpTo("a", 0), 1, 0).done).toBe(true);
  });
});
