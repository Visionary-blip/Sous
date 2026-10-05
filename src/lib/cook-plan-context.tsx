import { createContext, useContext } from "react";
import type { useCookPlan } from "@/lib/use-cook-plan";

type CookPlanApi = ReturnType<typeof useCookPlan>;

/** Lets any dish bar plan itself without every screen passing the handler down. */
export const CookPlanContext = createContext<CookPlanApi | null>(null);

export function useCookPlanContext(): CookPlanApi {
  const api = useContext(CookPlanContext);
  if (!api) throw new Error("CookPlanContext.Provider is missing");
  return api;
}
