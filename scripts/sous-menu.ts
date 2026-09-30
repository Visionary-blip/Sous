import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Every path below is absolute and derived from this file, so the menu behaves the
// same whatever directory it was started from.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const NEXT_TO_NODE = join(dirname(process.execPath), "npm");
const NPM = existsSync(NEXT_TO_NODE) ? NEXT_TO_NODE : "npm";

type Command = [program: string, ...args: string[]];

interface Entry {
  label: string;
  hint: string;
  /** null means leave the menu. */
  command: Command | null;
}

const npm = (...args: string[]): Command => [NPM, "--prefix", ROOT, ...args];

const ENTRIES: Entry[] = [
  { label: "Start dev server", hint: "http://localhost:5173", command: npm("run", "dev") },
  { label: "Start dev server for your phone", hint: "shares it on your Wi-Fi", command: npm("run", "dev", "--", "--host") },
  { label: "Run tests", hint: "vitest, once", command: npm("test") },
  { label: "Check types", hint: "tsc", command: npm("run", "typecheck") },
  { label: "Build for production", hint: "into dist/", command: npm("run", "build") },
  { label: "Preview the production build", hint: "serves dist/", command: npm("run", "preview") },
  { label: "Install dependencies", hint: "npm install", command: npm("install") },
  { label: "Git status", hint: "what has changed", command: ["git", "-C", ROOT, "status"] },
  { label: "Quit", hint: "", command: null },
];

const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const ACCENT = "\x1b[38;5;214m";
const RESET = "\x1b[0m";
const CLEAR = "\x1b[2J\x1b[H";
const HIDE_CURSOR = "\x1b[?25l";
const SHOW_CURSOR = "\x1b[?25h";

function line(entry: Entry, active: boolean): string {
  const hint = entry.hint ? `${DIM}  ${entry.hint}${RESET}` : "";
  return active ? `${ACCENT}${BOLD}❯ ${entry.label}${RESET}${hint}` : `  ${entry.label}${hint}`;
}

function draw(selected: number): void {
  const rows = ENTRIES.map((entry, i) => line(entry, i === selected));
  const header = `${BOLD}Sous${RESET}  ${DIM}${ROOT}${RESET}\n${DIM}↑/↓ move · enter run · q quit${RESET}\n`;
  process.stdout.write(`${CLEAR}${HIDE_CURSOR}${header}\n${rows.join("\n")}\n`);
}

type Key = "up" | "down" | "enter" | "quit" | "other";

function toKey(data: string): Key {
  if (data === "\x1b[A" || data === "k") return "up";
  if (data === "\x1b[B" || data === "j") return "down";
  if (data === "\r" || data === "\n") return "enter";
  if (data === "q" || data === "\x03" || data === "\x1b") return "quit";
  return "other";
}

/** A fast key repeat can arrive as one chunk, so split it into single keys. */
function toKeys(chunk: string): Key[] {
  return (chunk.match(/\x1b\[[0-9;]*[A-Za-z]|[\s\S]/g) ?? []).map(toKey);
}

function readKey(): Promise<string> {
  return new Promise((done) => {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once("data", (chunk) => {
      process.stdin.setRawMode(false);
      process.stdin.pause();
      done(chunk.toString());
    });
  });
}

/** Returns the chosen entry, or null if the user quit. */
async function choose(start: number): Promise<{ entry: Entry | null; index: number }> {
  let selected = start;
  for (;;) {
    draw(selected);
    for (const key of toKeys(await readKey())) {
      if (key === "quit") return { entry: null, index: selected };
      if (key === "enter") return { entry: ENTRIES[selected], index: selected };
      if (key === "up") selected = (selected + ENTRIES.length - 1) % ENTRIES.length;
      if (key === "down") selected = (selected + 1) % ENTRIES.length;
    }
  }
}

function execute(command: Command): Promise<number> {
  return new Promise((done) => {
    // Ctrl-C should stop the child (the dev server), not this menu.
    const ignore = () => {};
    process.on("SIGINT", ignore);
    const child = spawn(command[0], command.slice(1), { cwd: ROOT, stdio: "inherit" });
    child.on("error", (err) => {
      process.stderr.write(`Could not start ${command[0]}: ${err.message}\n`);
      process.off("SIGINT", ignore);
      done(1);
    });
    child.on("close", (code) => {
      process.off("SIGINT", ignore);
      done(code ?? 0);
    });
  });
}

async function runEntry(command: Command): Promise<void> {
  process.stdout.write(`${CLEAR}${SHOW_CURSOR}${DIM}$ ${command.join(" ")}${RESET}\n\n`);
  const code = await execute(command);
  process.stdout.write(`\n${DIM}Finished with exit code ${code}. Press any key to return to the menu.${RESET}`);
  await readKey();
}

async function main(): Promise<void> {
  if (!process.stdin.isTTY) {
    process.stderr.write("The Sous menu needs an interactive terminal.\n");
    process.exit(1);
  }
  let index = 0;
  for (;;) {
    const choice = await choose(index);
    index = choice.index;
    if (!choice.entry?.command) break;
    await runEntry(choice.entry.command);
  }
  process.stdout.write(`${CLEAR}${SHOW_CURSOR}`);
}

await main();
