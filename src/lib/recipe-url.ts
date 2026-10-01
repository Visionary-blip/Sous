const PRIVATE_HOST = /^(localhost|.*\.local|.*\.internal|0\.0\.0\.0|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1?\]?$|\[?f[cd][0-9a-f]{2}:)/i;

/** True only for a public web address, so the fetch helper can't be aimed at the owner's own network. */
export function isPublicHttpUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    return (u.protocol === "http:" || u.protocol === "https:") && !PRIVATE_HOST.test(u.hostname);
  } catch {
    return false;
  }
}
