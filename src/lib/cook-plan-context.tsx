import { createContext, useContext } from "react";
import type { RecipeMatch } from "@/lib/match";

interface CookPlanApi {
  isPlanned: (id: string) => boolean;
  /** Opens the dinner-time pop-up for a dish. */
  openPot: (match: RecipeMatch) => void;
}

/** Lets any dish bar open the dinner pop-up without every screen passing the handler down. */
export const CookPlanContext = createContext<CookPlanApi | null>(null);

export function useCookPlanContext(): CookPlanApi {
  const api = useContext(CookPlanContext);
  if (!api) throw new Error("CookPlanContext.Provider is missing");
  return api;
}
