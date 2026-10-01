import { describe, expect, it } from "vitest";
import { DEFAULT_PROFILE_ID, defaultProfiles, makeProfile, normalizeUsername, scopeOf, toggleDiet, updateProfile, usernameError } from "@/lib/profiles";

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

describe("usernames", () => {
  it("lowercases and drops a leading @", () => {
    expect(normalizeUsername("  @Sam_K ")).toBe("sam_k");
    expect(makeProfile("1", "Sam", "", "@Sam_K").username).toBe("sam_k");
  });

  it("accepts 3 to 20 letters, numbers and underscores, and allows clearing", () => {
    const all = defaultProfiles();
    expect(usernameError(all, "me", "sam_k")).toBeNull();
    expect(usernameError(all, "me", "")).toBeNull();
    for (const bad of ["ab", "has space", "a".repeat(21), "dot.name"]) expect(usernameError(all, "me", bad)).not.toBeNull();
  });

  it("refuses one another profile has, ignoring case, but not your own", () => {
    const all = [{ ...makeProfile("a", "A", "", "sam") }, makeProfile("b", "B", "")];
    expect(usernameError(all, "b", "SAM")).toMatch(/already/);
    expect(usernameError(all, "a", "sam")).toBeNull();
  });
});
