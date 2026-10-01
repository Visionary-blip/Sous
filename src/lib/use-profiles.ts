import { addAvoided, toggleDiet, defaultProfiles, DEFAULT_PROFILE_ID, makeProfile, normalizeUsername, scopeOf, updateProfile, usernameError } from "@/lib/profiles";
import type { UnitSystem } from "@/lib/convert-units";
import type { DietId } from "@/lib/diets";
import { parseHousehold } from "@/lib/household";
import { forgetScope, newId, usePersistentState } from "@/lib/storage";

/** Who is using this device. Profiles are a convenience on this device, not a login: nothing is checked or sent. */
export function useProfiles() {
  const [profiles, setProfiles] = usePersistentState("profiles", defaultProfiles);
  const [activeId, setActiveId] = usePersistentState("active-profile", () => DEFAULT_PROFILE_ID);
  const active = profiles.find((p) => p.id === activeId) ?? profiles[0];

  return {
    profiles,
    active,
    switchTo: setActiveId,
    /** Returns why it couldn't add (a bad or taken username), or null on success. */
    add(name: string, phone: string, username: string): string | null {
      const problem = usernameError(profiles, "", username);
      if (problem) return problem;
      const profile = makeProfile(newId(), name, phone, username);
      setProfiles((all) => [...all, profile]);
      setActiveId(profile.id);
      return null;
    },
    /** Sets or clears the current profile's username; returns the reason it was refused, or null. */
    setUsername(raw: string): string | null {
      const problem = usernameError(profiles, active.id, raw);
      if (!problem) setProfiles((all) => updateProfile(all, active.id, { username: normalizeUsername(raw) || undefined }));
      return problem;
    },
    toggleDiet: (diet: DietId) => setProfiles((all) => updateProfile(all, active.id, { diets: toggleDiet(active.diets, diet) })),
    addAvoid: (raw: string) => setProfiles((all) => updateProfile(all, active.id, { avoid: addAvoided(active.avoid ?? [], raw) })),
    removeAvoid: (word: string) => setProfiles((all) => updateProfile(all, active.id, { avoid: (active.avoid ?? []).filter((w) => w !== word) })),
    setHousehold: (raw: string) => setProfiles((all) => updateProfile(all, active.id, { household: parseHousehold(raw) })),
    setUnits: (units: UnitSystem | undefined) => setProfiles((all) => updateProfile(all, active.id, { units })),
    remove(id: string) {
      const gone = profiles.find((p) => p.id === id);
      if (!gone || id === DEFAULT_PROFILE_ID) return;
      forgetScope(scopeOf(gone));
      setProfiles((all) => all.filter((p) => p.id !== id));
      if (activeId === id) setActiveId(DEFAULT_PROFILE_ID);
    },
  };
}
