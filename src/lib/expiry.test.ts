import { describe, expect, it } from "vitest";
import { expiringSoon, expiryLabel } from "@/lib/expiry";
import type { GroceryItem } from "@/types";

const today = new Date(2026, 8, 30);

function item(name: string, expiresOn?: string): GroceryItem {
  return { id: name, name, group: "Other", expiresOn, addedOn: "2026-09-29" };
}

describe("expiringSoon", () => {
  it("keeps items due within 3 days or already expired, soonest first", () => {
    const list = [item("later", "2026-10-10"), item("three", "2026-10-03"), item("old", "2026-09-28"), item("none"), item("today", "2026-09-30")];
    expect(expiringSoon(list, today).map((g) => g.name)).toEqual(["old", "today", "three"]);
  });
});

describe("expiryLabel", () => {
  it("words the days left", () => {
    expect(expiryLabel(item("a", "2026-09-30"), today)).toEqual({ text: "Use today", tone: "danger" });
    expect(expiryLabel(item("a", "2026-10-01"), today)?.text).toBe("Use by tomorrow");
    expect(expiryLabel(item("a"), today)).toBeNull();
  });
});
