import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, Plugin } from "vite";
import { extractRecipe } from "./src/lib/parse-recipe.ts";
import { isPublicHttpUrl } from "./src/lib/recipe-url.ts";

const MAX_BYTES = 3_000_000;

function reply(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify(body));
}

async function fetchPage(url: string): Promise<string> {
  // Some sites refuse requests that don't look like a browser, so we send a browser's user agent.
  const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (Sous recipe reader)" }, signal: AbortSignal.timeout(15_000) });
  if (!res.ok) throw new Error(`The site answered ${res.status}, so it won't let Sous read that page.`);
  if (!isPublicHttpUrl(res.url)) throw new Error("That link redirected somewhere Sous won't open.");
  return (await res.text()).slice(0, MAX_BYTES);
}

async function handle(req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction): Promise<void> {
  const parsed = new URL(req.url ?? "", "http://sous.local");
  if (parsed.pathname !== "/api/recipe") return next();
  const target = parsed.searchParams.get("url") ?? "";
  if (!isPublicHttpUrl(target)) return reply(res, 400, { error: "That doesn't look like a web link." });
  try {
    const recipe = extractRecipe(await fetchPage(target), target);
    if (!recipe) return reply(res, 422, { error: "No recipe found on that page." });
    reply(res, 200, { recipe });
  } catch (e) {
    reply(res, 502, { error: e instanceof Error ? e.message : "Couldn't reach that page." });
  }
}

/** Dev and preview servers only: browsers can't read other sites directly, so this fetches the page for them. */
export function recipeProxy(): Plugin {
  const install = (server: { middlewares: Connect.Server }) => {
    server.middlewares.use((req, res, next) => void handle(req, res, next));
  };
  return { name: "sous-recipe-proxy", configureServer: install, configurePreviewServer: install };
}
