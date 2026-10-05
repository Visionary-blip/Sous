import { describe, expect, it } from "vitest";
import { alertKey, alertSummary, shouldNotify } from "@/lib/expiry-alert";
import type { GroceryItem } from "@/types";

const today = new Date(2026, 9, 4);
const item = (name: string, expiresOn: string): GroceryItem => ({ id: name, name, group: "Other", expiresOn, addedOn: "2026-10-01" });
const due = [item("milk", "2026-10-05"), item("spinach", "2026-10-04")];

describe("shouldNotify", () => {
  it("fires for a new list or a new day, not for the same list again today, and never for an empty one", () => {
    expect(shouldNotify(null, due, "2026-10-04")).toBe(true);
    expect(shouldNotify({ date: "2026-10-04", key: alertKey(due) }, due, "2026-10-04")).toBe(false);
    expect(shouldNotify({ date: "2026-10-03", key: alertKey(due) }, due, "2026-10-04")).toBe(true);
    expect(shouldNotify({ date: "2026-10-04", key: "other" }, due, "2026-10-04")).toBe(true);
    expect(shouldNotify(null, [], "2026-10-04")).toBe(false);
  });
});

describe("alertSummary", () => {
  it("counts the items and names the first few with when each is due", () => {
    const s = alertSummary(due, today);
    expect(s.title).toBe("2 items due within 2 days");
    expect(s.body).toBe("milk (use by tomorrow), spinach (use today)");
  });

  it("says 'and N more' past four", () => {
    const many = ["a", "b", "c", "d", "e", "f"].map((n) => item(n, "2026-10-05"));
    expect(alertSummary(many, today).body.endsWith("and 2 more")).toBe(true);
    expect(alertSummary([due[0]], today).title).toBe("1 item due within 2 days");
  });
});
