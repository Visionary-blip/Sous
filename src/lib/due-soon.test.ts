import { describe, expect, it } from "vitest";
import { dueSoon } from "@/lib/expiry";
import type { GroceryItem } from "@/types";

const today = new Date(2026, 9, 4);
const item = (name: string, expiresOn?: string): GroceryItem => ({ id: name, name, group: "Other", expiresOn, addedOn: "2026-10-01" });

describe("dueSoon", () => {
  it("keeps items due within 2 days or already expired, soonest first, and skips later and undated ones", () => {
    const list = [item("three", "2026-10-07"), item("two", "2026-10-06"), item("old", "2026-10-02"), item("none"), item("today", "2026-10-04")];
    expect(dueSoon(list, today).map((g) => g.name)).toEqual(["old", "today", "two"]);
  });
});
