import { describe, expect, it } from "vitest";
import { EMPTY_CLASSICS, toggleLiked, toggleWish } from "@/lib/classics";

describe("toggleLiked", () => {
  it("adds a recipe to the front and removes it on the second call", () => {
    const once = toggleLiked(toggleLiked(EMPTY_CLASSICS, "a"), "b");
    expect(once.liked).toEqual(["b", "a"]);
    expect(toggleLiked(once, "b").liked).toEqual(["a"]);
  });

  it("takes the recipe off the wishlist", () => {
    const wished = toggleWish(EMPTY_CLASSICS, "a");
    expect(toggleLiked(wished, "a")).toEqual({ liked: ["a"], wish: [] });
  });
});

describe("toggleWish", () => {
  it("adds and removes", () => {
    const once = toggleWish(EMPTY_CLASSICS, "a");
    expect(once.wish).toEqual(["a"]);
    expect(toggleWish(once, "a").wish).toEqual([]);
  });

  it("ignores a recipe that is already liked", () => {
    const liked = toggleLiked(EMPTY_CLASSICS, "a");
    expect(toggleWish(liked, "a")).toBe(liked);
  });
});
