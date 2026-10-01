import { describe, expect, it } from "vitest";
import { parseHousehold, servingsNote } from "@/lib/household";

describe("servingsNote", () => {
  it("says how many a dish serves and flags a dish too small for the household", () => {
    expect(servingsNote(4, undefined)).toBe("Serves 4");
    expect(servingsNote(4, 4)).toBe("Serves 4");
    expect(servingsNote(2, 4)).toBe("Serves 2 · small for 4");
  });
});

describe("parseHousehold", () => {
  it("accepts 1 to 12 and treats anything else as not set", () => {
    expect(parseHousehold("3")).toBe(3);
    for (const bad of ["", "0", "13", "2.5", "abc"]) expect(parseHousehold(bad)).toBeUndefined();
  });
});
