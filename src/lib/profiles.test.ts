import { describe, expect, it } from "vitest";
import { DEFAULT_PROFILE_ID, defaultProfiles, makeProfile, scopeOf, toggleDiet, updateProfile } from "@/lib/profiles";

describe("profiles", () => {
  it("keeps the first profile on the old, unprefixed keys and gives others their own prefix", () => {
    expect(scopeOf(defaultProfiles()[0])).toBe("");
    expect(scopeOf(makeProfile("abc", "Sam", ""))).toBe("abc:");
  });

  it("trims names, falls back to Guest and keeps the phone only when given", () => {
    expect(makeProfile("1", "  Sam ", " 555 ")).toEqual({ id: "1", name: "Sam", phone: "555", diets: [] });
    expect(makeProfile("2", " ", "")).toEqual({ id: "2", name: "Guest", diets: [] });
  });

  it("toggles diets and updates one profile only", () => {
    expect(toggleDiet(["keto"], "vegan")).toEqual(["keto", "vegan"]);
    expect(toggleDiet(["keto", "vegan"], "keto")).toEqual(["vegan"]);
    const all = [...defaultProfiles(), makeProfile("b", "B", "")];
    const next = updateProfile(all, "b", { diets: ["keto"] });
    expect(next[0].diets).toEqual([]);
    expect(next[1].diets).toEqual(["keto"]);
    expect(all[0].id).toBe(DEFAULT_PROFILE_ID);
  });
});
