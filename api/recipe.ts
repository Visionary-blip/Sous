/**
 * The recipe reader, as one self-contained file so the host's function builder needs nothing else
 * (Vercel does not support the "@/" alias inside /api, and imports across folders are untested there).
 * It is also imported by the dev and preview servers (recipe-proxy.ts) and by the app for its types.
 *
 * Browsers can't read other websites, so this fetches a recipe page from an allowed site, reads the
 * recipe data the page embeds for search engines, and returns ingredients and shortened steps.
 */

/** Sites the reader will fetch; anything else is refused so the endpoint can't be aimed at arbitrary pages. */
export const ALLOWED_SITES = [
  "bbcgoodfood.com",
  "recipetineats.com",
  "budgetbytes.com",
  "epicurious.com",
  "kingarthurbaking.com",
  "delish.com",
  "cooking.nytimes.com",
  "sallysbakingaddiction.com",
  "minimalistbaker.com",
  "cookieandkate.com",
  "loveandlemons.com",
  "tasty.co",
  "jamieoliver.com",
  "bonappetit.com",
];

/** True for an http(s) address on an allowed site or one of its subdomains ("notbbcgoodfood.com" does not count). */
export function isAllowedRecipeUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    const web = u.protocol === "http:" || u.protocol === "https:";
    return web && ALLOWED_SITES.some((d) => u.hostname === d || u.hostname.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

export interface SimpleRecipe {
  url: string;
  title: string;
  /** Host of the page it came from, shown so the source is always credited. */
  source: string;
  minutes: number | null;
  ingredients: string[];
  steps: string[];
}

type Json = Record<string, unknown>;

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function plainText(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, name: string) => ENTITIES[name.toLowerCase()] ?? m)
    .replace(/\s+/g, " ")
    .trim();
}

function isRecipeNode(node: Json): boolean {
  const type = node["@type"];
  return type === "Recipe" || (Array.isArray(type) && type.includes("Recipe"));
}

function findRecipeNode(value: unknown): Json | null {
  if (Array.isArray(value)) return value.map(findRecipeNode).find((n) => n !== null) ?? null;
  if (typeof value !== "object" || value === null) return null;
  const node = value as Json;
  return isRecipeNode(node) ? node : findRecipeNode(node["@graph"]);
}

function jsonLdBlocks(html: string): unknown[] {
  const blocks = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
  return blocks.flatMap((b) => {
    try {
      return [JSON.parse(b[1]) as unknown];
    } catch {
      return [];
    }
  });
}

/** "PT1H30M" to 90; null when the site gave no usable time. */
export function minutesFromDuration(iso: unknown): number | null {
  const m = typeof iso === "string" ? /^P(?:\d+D)?T?(?:(\d+)H)?(?:(\d+)M)?/.exec(iso) : null;
  const total = m ? Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0) : 0;
  return total > 0 ? total : null;
}

function instructionTexts(value: unknown): string[] {
  if (typeof value === "string") return value.split(/\n+/);
  if (Array.isArray(value)) return value.flatMap(instructionTexts);
  if (typeof value !== "object" || value === null) return [];
  const node = value as Json;
  return node.itemListElement ? instructionTexts(node.itemListElement) : instructionTexts(node.text);
}

/** Keeps the first sentence of a step, plus the second if the pair still reads short. */
export function shortenStep(step: string, limit = 200): string {
  const sentences = step.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g) ?? [step];
  const first = sentences[0].trim();
  const pair = sentences.length > 1 ? `${first} ${sentences[1].trim()}` : first;
  const kept = pair.length <= limit ? pair : first;
  return kept.length <= limit ? kept : `${kept.slice(0, limit).replace(/\s+\S*$/, "")}…`;
}

function cleanList(texts: string[]): string[] {
  return texts.map(plainText).filter((t) => t.length > 0);
}

function listOf(value: unknown): string[] {
  return Array.isArray(value) ? cleanList(value.filter((v): v is string => typeof v === "string")) : [];
}

/**
 * Reads the structured recipe most sites embed for search engines (JSON-LD). Returns null when the
 * page has none, or none with both ingredients and steps. Steps are shortened, not reworded.
 */
export function extractRecipe(html: string, url: string): SimpleRecipe | null {
  const node = findRecipeNode(jsonLdBlocks(html));
  if (!node) return null;
  const ingredients = listOf(node.recipeIngredient);
  const steps = cleanList(instructionTexts(node.recipeInstructions)).map((s) => shortenStep(s));
  if (ingredients.length === 0 || steps.length === 0) return null;
  const title = typeof node.name === "string" ? plainText(node.name) : new URL(url).hostname;
  const minutes = minutesFromDuration(node.totalTime);
  return { url, title, source: new URL(url).hostname.replace(/^www\./, ""), minutes, ingredients, steps };
}

const MAX_BYTES = 3_000_000;
const CACHE = "public, s-maxage=86400, stale-while-revalidate=604800";

function reply(status: number, body: unknown, cache = false): Response {
  const headers = { "content-type": "application/json", ...(cache ? { "cache-control": CACHE } : {}) };
  return new Response(JSON.stringify(body), { status, headers });
}

async function fetchPage(url: string): Promise<string> {
  // Some sites refuse requests that don't look like a browser, so we send a browser's user agent.
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (Sous recipe reader)" }, signal: AbortSignal.timeout(8_000) });
  if (!res.ok) throw new Error(`The site answered ${res.status}, so it won't let Sous read that page.`);
  if (!isAllowedRecipeUrl(res.url)) throw new Error("That link redirected somewhere Sous won't open.");
  return (await res.text()).slice(0, MAX_BYTES);
}

/** GET /api/recipe?url=<recipe page>: returns { recipe } or { error }. */
export async function GET(request: Request): Promise<Response> {
  const target = new URL(request.url).searchParams.get("url") ?? "";
  if (!isAllowedRecipeUrl(target)) return reply(400, { error: "That site isn't on Sous's list of recipe sites yet." });
  try {
    const recipe = extractRecipe(await fetchPage(target), target);
    return recipe ? reply(200, { recipe }, true) : reply(422, { error: "No recipe found on that page." });
  } catch (e) {
    return reply(502, { error: e instanceof Error ? e.message : "Couldn't reach that page." });
  }
}
