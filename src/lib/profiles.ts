import type { DietId } from "@/lib/diets";

export interface Profile {
  id: string;
  name: string;
  /** Kept only as a label; no text message is sent. */
  phone?: string;
  diets: DietId[];
}

/** The first profile keeps the keys the app used before profiles existed, so nothing saved is lost. */
export const DEFAULT_PROFILE_ID = "me";

export function defaultProfiles(): Profile[] {
  return [{ id: DEFAULT_PROFILE_ID, name: "Me", diets: [] }];
}

/** Prefix that keeps one profile's fridge, cabinet and Classics apart from another's. */
export function scopeOf(profile: Profile): string {
  return profile.id === DEFAULT_PROFILE_ID ? "" : `${profile.id}:`;
}

export function makeProfile(id: string, name: string, phone: string): Profile {
  const label = phone.trim();
  return { id, name: name.trim() || "Guest", ...(label ? { phone: label } : {}), diets: [] };
}

export function toggleDiet(diets: DietId[], diet: DietId): DietId[] {
  return diets.includes(diet) ? diets.filter((d) => d !== diet) : [...diets, diet];
}

export function updateProfile(profiles: Profile[], id: string, change: Partial<Profile>): Profile[] {
  return profiles.map((p) => (p.id === id ? { ...p, ...change } : p));
}
