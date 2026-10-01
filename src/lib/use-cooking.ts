import { useState } from "react";
import { jumpTo, stepBy, type Cooking } from "@/lib/cooking";

// In memory only: a half-finished cook isn't worth restoring after a reload.
export function useCooking() {
  const [cooking, setCooking] = useState<Cooking | null>(null);
  return {
    cooking,
    jump: (id: string, step: number) => setCooking(jumpTo(id, step)),
    step: (delta: 1 | -1, total: number) => setCooking((c) => c && stepBy(c, delta, total)),
    stop: () => setCooking(null),
  };
}
