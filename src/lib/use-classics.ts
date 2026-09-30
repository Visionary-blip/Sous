import { EMPTY_CLASSICS, toggleLiked, toggleWish } from "@/lib/classics";
import { usePersistentState } from "@/lib/storage";
import type { Classics } from "@/types";

export function useClassics() {
  const [classics, setClassics] = usePersistentState<Classics>("classics", () => EMPTY_CLASSICS);
  return {
    classics,
    like: (id: string) => setClassics((c) => toggleLiked(c, id)),
    wish: (id: string) => setClassics((c) => toggleWish(c, id)),
  };
}
