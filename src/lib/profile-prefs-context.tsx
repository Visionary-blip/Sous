import { createContext, useContext } from "react";
import type { UnitSystem } from "@/lib/convert-units";

export interface ProfilePrefs {
  household?: number;
  organic?: boolean;
  units?: UnitSystem;
}

/** The current profile's household size and units, for screens that only read them. */
export const ProfilePrefsContext = createContext<ProfilePrefs>({});

export function useProfilePrefs(): ProfilePrefs {
  return useContext(ProfilePrefsContext);
}
