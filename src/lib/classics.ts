import type { Classics } from "@/types";

export const EMPTY_CLASSICS: Classics = { liked: [], wish: [] };

function toggle(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids];
}

/** Liking a recipe takes it off the Wishlist: you have made it now. */
export function toggleLiked(c: Classics, id: string): Classics {
  return { liked: toggle(c.liked, id), wish: c.wish.filter((x) => x !== id) };
}

/** A liked recipe can't be wished for, so it is left alone. */
export function toggleWish(c: Classics, id: string): Classics {
  return c.liked.includes(id) ? c : { ...c, wish: toggle(c.wish, id) };
}
