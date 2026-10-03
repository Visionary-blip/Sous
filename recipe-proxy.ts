import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, Plugin } from "vite";
import { GET } from "./api/recipe.ts";

/** Hands a Node request to the same function the deployed app runs, and writes its Response back. */
async function handle(req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction): Promise<void> {
  const url = new URL(req.url ?? "", "http://sous.local");
  if (url.pathname !== "/api/recipe") return next();
  const response = await GET(new Request(url));
  res.statusCode = response.status;
  response.headers.forEach((value, name) => res.setHeader(name, value));
  res.end(await response.text());
}

/** Dev and preview servers: serves /api/recipe from api/recipe.ts so the app behaves the same as deployed. */
export function recipeProxy(): Plugin {
  const install = (server: { middlewares: Connect.Server }) => {
    server.middlewares.use((req, res, next) => void handle(req, res, next));
  };
  return { name: "sous-recipe-proxy", configureServer: install, configurePreviewServer: install };
}
