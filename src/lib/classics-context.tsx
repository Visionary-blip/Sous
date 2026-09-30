import { createContext, useContext } from "react";
import type { useClassics } from "@/lib/use-classics";

type ClassicsApi = ReturnType<typeof useClassics>;

/** Lets any dish bar like or wish for itself without every screen passing the handlers down. */
export const ClassicsContext = createContext<ClassicsApi | null>(null);

export function useClassicsContext(): ClassicsApi {
  const api = useContext(ClassicsContext);
  if (!api) throw new Error("ClassicsContext.Provider is missing");
  return api;
}
