import { toggleDiet, defaultProfiles, DEFAULT_PROFILE_ID, makeProfile, scopeOf, updateProfile } from "@/lib/profiles";
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
    add(name: string, phone: string) {
      const profile = makeProfile(newId(), name, phone);
      setProfiles((all) => [...all, profile]);
      setActiveId(profile.id);
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
