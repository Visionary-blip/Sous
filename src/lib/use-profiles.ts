import { toggleDiet, defaultProfiles, DEFAULT_PROFILE_ID, makeProfile, normalizeUsername, scopeOf, updateProfile, usernameError } from "@/lib/profiles";
import type { DietId } from "@/lib/diets";
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
    remove(id: string) {
      const gone = profiles.find((p) => p.id === id);
      if (!gone || id === DEFAULT_PROFILE_ID) return;
      forgetScope(scopeOf(gone));
      setProfiles((all) => all.filter((p) => p.id !== id));
      if (activeId === id) setActiveId(DEFAULT_PROFILE_ID);
    },
  };
}
