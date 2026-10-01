import type { DietId } from "@/lib/diets";

export interface Profile {
  id: string;
  name: string;
  /** Lowercase handle shown as @name; unique among this device's profiles. */
  username?: string;
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

export function makeProfile(id: string, name: string, phone: string, username = ""): Profile {
  const label = phone.trim();
  const handle = normalizeUsername(username);
  return { id, name: name.trim() || "Guest", ...(handle ? { username: handle } : {}), ...(label ? { phone: label } : {}), diets: [] };
}

/** "  @Sam_K " becomes "sam_k". */
export function normalizeUsername(raw: string): string {
  return raw.trim().replace(/^@/, "").toLowerCase();
}

/** Why a username can't be used, or null when it is fine. An empty one is allowed and clears the handle. */
export function usernameError(profiles: Profile[], id: string, raw: string): string | null {
  const handle = normalizeUsername(raw);
  if (!handle) return null;
  if (!/^[a-z0-9_]{3,20}$/.test(handle)) return "Use 3 to 20 letters, numbers or underscores.";
  const taken = profiles.some((p) => p.id !== id && p.username === handle);
  return taken ? "Another profile already has that username." : null;
}

export function toggleDiet(diets: DietId[], diet: DietId): DietId[] {
  return diets.includes(diet) ? diets.filter((d) => d !== diet) : [...diets, diet];
}

export function updateProfile(profiles: Profile[], id: string, change: Partial<Profile>): Profile[] {
  return profiles.map((p) => (p.id === id ? { ...p, ...change } : p));
}
