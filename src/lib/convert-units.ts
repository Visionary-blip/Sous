export type UnitSystem = "us" | "metric";

const FRACTIONS: Record<string, number> = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3 };
const NUM = String.raw`(?:\d+\s+\d+\/\d+|\d+\/\d+|\d*\s?[½¼¾⅓⅔]|\d+(?:\.\d+)?)`;
const US_UNIT = String.raw`cups?|tablespoons?|tbsps?|tbs|teaspoons?|tsps?|ounces?|oz|pounds?|lbs?`;
const METRIC_UNIT = String.raw`kilograms?|kg|grams?|g|millilit(?:er|re)s?|ml|lit(?:er|re)s?|l`;
const END = String.raw`(?![A-Za-z])`;
const QUANTITY = new RegExp(String.raw`(?<![\d./])(${NUM})(?:\s?[-–]\s?(${NUM}))?\s?(${US_UNIT}|${METRIC_UNIT})${END}`, "gi");
const HAS_US = new RegExp(String.raw`\d\s?(?:${US_UNIT})${END}`, "i");
const HAS_METRIC = new RegExp(String.raw`\d\s?(?:${METRIC_UNIT})${END}`, "i");
const TEMPERATURE = /(?<![\d.])(\d{2,3})\s?(°|º|degrees\s)?\s?([CF])(?![A-Za-z])/g;

/** Millilitres or grams in one of this unit. Cups, spoons and ounces use the common kitchen sizes. */
const BASE: Record<string, { kind: "volume" | "weight"; size: number }> = {
  cup: { kind: "volume", size: 240 },
  tbsp: { kind: "volume", size: 15 },
  tsp: { kind: "volume", size: 5 },
  ml: { kind: "volume", size: 1 },
  l: { kind: "volume", size: 1000 },
  oz: { kind: "weight", size: 28.35 },
  lb: { kind: "weight", size: 453.6 },
  g: { kind: "weight", size: 1 },
  kg: { kind: "weight", size: 1000 },
};

const ALIASES: [RegExp, string][] = [
  [/^cups?$/, "cup"], [/^(tablespoons?|tbsps?|tbs)$/, "tbsp"], [/^(teaspoons?|tsps?)$/, "tsp"],
  [/^(ounces?|oz)$/, "oz"], [/^(pounds?|lbs?)$/, "lb"], [/^(kilograms?|kg)$/, "kg"], [/^(grams?|g)$/, "g"],
  [/^(millilit(er|re)s?|ml)$/, "ml"], [/^(lit(er|re)s?|l)$/, "l"],
];

function unitName(raw: string): string {
  const word = raw.toLowerCase();
  return ALIASES.find(([re]) => re.test(word))?.[1] ?? word;
}

function parseNumber(raw: string): number {
  const text = raw.trim();
  const unicode = /^(\d*)\s?([½¼¾⅓⅔])$/.exec(text);
  if (unicode) return Number(unicode[1] || 0) + FRACTIONS[unicode[2]];
  const mixed = /^(\d+)\s+(\d+)\/(\d+)$/.exec(text);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const simple = /^(\d+)\/(\d+)$/.exec(text);
  return simple ? Number(simple[1]) / Number(simple[2]) : Number(text);
}

function roundTo(x: number, step: number): number {
  return Math.max(step, Math.round(x / step) * step);
}

function fraction(x: number, step: number): string {
  const n = roundTo(x, step);
  const whole = Math.floor(n);
  const part = { 0: "", 0.25: "1/4", 0.5: "1/2", 0.75: "3/4" }[n - whole] ?? "";
  return [whole || "", part].filter(Boolean).join(" ");
}

interface Shown {
  unit: string;
  show: (base: number) => string;
}

function metricShown(kind: "volume" | "weight", top: number): Shown {
  const big = top >= 1000;
  const unit = kind === "volume" ? (big ? "l" : "ml") : big ? "kg" : "g";
  return { unit, show: (b) => (big ? String(Math.round(b / 100) / 10) : String(roundTo(b, b < 10 ? 1 : 5))) };
}

function usShown(kind: "volume" | "weight", top: number): Shown {
  if (kind === "weight") return top >= 454 ? { unit: "lb", show: (b) => fraction(b / 453.6, 0.25) } : { unit: "oz", show: (b) => fraction(b / 28.35, 0.5) };
  if (top < 15) return { unit: "tsp", show: (b) => fraction(b / 5, 0.25) };
  return top < 60 ? { unit: "tbsp", show: (b) => fraction(b / 15, 0.5) } : { unit: "cup", show: (b) => fraction(b / 240, 0.25) };
}

function plural(unit: string, shown: string): string {
  return unit === "cup" && shown !== "1" && shown !== "1/2" && shown !== "1/4" && shown !== "3/4" ? "cups" : unit;
}

function systemOf(unit: string): UnitSystem {
  return ["cup", "tbsp", "tsp", "oz", "lb"].includes(unit) ? "us" : "metric";
}

function convertQuantity(match: string, a: string, b: string | undefined, rawUnit: string, target: UnitSystem): string {
  const unit = unitName(rawUnit);
  if (systemOf(unit) === target) return match;
  const { kind, size } = BASE[unit];
  const bases = [a, b].filter((n): n is string => Boolean(n)).map((n) => parseNumber(n) * size);
  const shown = (target === "metric" ? metricShown : usShown)(kind, Math.max(...bases));
  const numbers = bases.map(shown.show);
  return `${numbers.join("-")} ${plural(shown.unit, numbers[numbers.length - 1])}`;
}

function convertTemperature(match: string, degrees: string, mark: string | undefined, scale: string, target: UnitSystem): string {
  const wantsF = target === "us";
  if ((scale === "F") === wantsF) return match;
  const value = Number(degrees);
  const out = wantsF ? (value * 9) / 5 + 32 : ((value - 32) * 5) / 9;
  return `${Math.round(out / 5) * 5}${mark ? "°" : ""}${wantsF ? "F" : "C"}`;
}

/**
 * Rewrites amounts and oven temperatures in recipe text into the chosen system. A line that already
 * gives both ("1 cup (240ml)") is left alone, so nothing ends up written twice.
 */
export function convertUnits(text: string, target: UnitSystem): string {
  if (HAS_US.test(text) && HAS_METRIC.test(text)) return text;
  return text
    .replace(QUANTITY, (m, a: string, b: string | undefined, u: string) => convertQuantity(m, a, b, u, target))
    .replace(TEMPERATURE, (m, d: string, mark: string | undefined, s: string) => convertTemperature(m, d, mark, s, target));
}
