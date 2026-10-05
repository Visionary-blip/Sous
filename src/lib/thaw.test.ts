import { describe, expect, it } from "vitest";
import { matchRecipe } from "@/lib/match";
import { anyDue, thawedOut, thawLine, thawMessage, thawNeeded, thawSchedule } from "@/lib/thaw";
import { markAlerted, planMeal, upgradePlanned } from "@/lib/cook-plan";
import { ASSUMED_DINNER, dinnerTime, formatTime, lockedTime } from "@/lib/dinner-time";
import type { GroceryItem, Recipe } from "@/types";

const today = new Date(2026, 9, 4);
const item = (name: string, frozen = false, group: GroceryItem["group"] = "Protein"): GroceryItem => ({ id: name, name, group, expiresOn: "2027-01-01", frozen: frozen || undefined, addedOn: "2026-10-01" });
const dish: Recipe = {
  id: "d", title: "Garlic Chicken", minutes: 20, servings: 2, tags: ["dinner"], steps: [],
  ingredients: [{ name: "chicken" }, { name: "garlic" }, { name: "rice" }, { name: "parsley", optional: true }],
};

describe("thawNeeded", () => {
  it("lists required ingredients that only come from the freezer", () => {
    const m = matchRecipe(dish, [item("chicken", true), item("garlic"), item("rice", true), item("parsley", true)], [], today);
    expect(thawNeeded(m).map((g) => g.name)).toEqual(["chicken", "rice"]);
  });

  it("is empty when nothing frozen is needed", () => {
    expect(thawNeeded(matchRecipe(dish, [item("chicken"), item("garlic")], [], today))).toEqual([]);
  });

  it("ignores a frozen copy when a fridge copy of the same thing is due sooner", () => {
    const fridge = { ...item("chicken"), id: "f", expiresOn: "2026-10-06" };
    expect(thawNeeded(matchRecipe(dish, [item("chicken", true), fridge], [], today))).toEqual([]);
  });
});

const dinner = new Date(2026, 9, 5, 18, 0); // Monday 6:00 PM
const now = new Date(2026, 9, 4, 12, 0); // Sunday noon

describe("thawSchedule", () => {
  const meal = matchRecipe(dish, [item("chicken", true), item("rice", true, "Grains & starches"), item("garlic")], [], today);

  it("works out when to take each frozen item out, earliest first", () => {
    const steps = thawSchedule(meal, dinner);
    expect(steps.map((s) => [s.item.name, s.hours])).toEqual([["chicken", 24], ["rice", 3]]);
    expect(steps[0].outAt).toEqual(new Date(2026, 9, 4, 18, 0));
    expect(steps[1].outAt).toEqual(new Date(2026, 9, 5, 15, 0));
  });

  it("words the line and the reminder, saying now once the time has come", () => {
    const steps = thawSchedule(meal, dinner);
    expect(thawLine(steps, now)).toBe("chicken by today 6:00 PM, rice by tomorrow 3:00 PM");
    expect(thawMessage("Garlic Chicken", steps, now)).toEqual({ title: "Thaw for Garlic Chicken", body: "Take out: chicken by today 6:00 PM, rice by tomorrow 3:00 PM." });
    expect(thawLine(steps, new Date(2026, 9, 4, 19, 0))).toBe("chicken now, rice by tomorrow 3:00 PM");
    expect(anyDue(steps, now)).toBe(false);
    expect(anyDue(steps, new Date(2026, 9, 4, 19, 0))).toBe(true);
  });
});

describe("thawedOut", () => {
  it("moves the chosen items to the fridge with a 2-day estimate and leaves the rest", () => {
    const list = [item("chicken", true), item("rice", true)];
    const out = thawedOut(list, ["chicken"], "2026-10-04");
    expect(out[0]).toMatchObject({ frozen: undefined, expiresOn: "2026-10-06", expiryEstimated: true });
    expect(out[1].frozen).toBe(true);
  });
});

describe("planning a meal", () => {
  it("plans a dish for the chosen dinner and replaces an earlier plan for it", () => {
    const first = planMeal([], "d", new Date(2026, 9, 4, 18, 0));
    expect(first).toEqual([{ id: "d", dinnerAt: new Date(2026, 9, 4, 18, 0).toISOString() }]);
    const second = planMeal([...first, { id: "other", dinnerAt: "x" }], "d", new Date(2026, 9, 5, 12, 0));
    expect(second.map((p) => p.id)).toEqual(["other", "d"]);
    expect(second[1].dinnerAt).toBe(new Date(2026, 9, 5, 12, 0).toISOString());
  });

  it("starts on the saved time, locked or not, and on 6:00 PM when nothing is saved", () => {
    expect(formatTime(dinnerTime({ locked: false, hour: 11, minute: 30 }))).toBe("11:30 AM");
    expect(dinnerTime(undefined)).toEqual(ASSUMED_DINNER);
  });

  it("only treats a time as locked in when it is locked", () => {
    expect(lockedTime({ locked: true, hour: 19, minute: 0 })).toEqual({ hour: 19, minute: 0 });
    expect(lockedTime({ locked: false, hour: 19, minute: 0 })).toBeNull();
    expect(lockedTime(undefined)).toBeNull();
  });

  it("marks one plan alerted and upgrades plans saved as bare ids", () => {
    expect(markAlerted([{ id: "a", dinnerAt: "x" }, { id: "b", dinnerAt: "y" }], "b")[1].alerted).toBe(true);
    expect(upgradePlanned(["old", { id: "new", dinnerAt: "z" }], undefined, now)[0].dinnerAt).toBe(new Date(2026, 9, 4, 18, 0).toISOString());
  });
});
