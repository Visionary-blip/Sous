/** Something that can be measured: weight and volume convert between units, anything else counts. */
interface Amount {
  value: number;
  /** Base unit family: "g", "ml", or "count:<unit>" (a bare number is "count:"). */
  family: string;
  /** Size of one typed unit in the family's base unit (1 for counts). */
  factor: number;
  /** The unit as the person typed it, reused when writing the result back. */
  unitText: string;
}

const UNITS: Record<string, [string, number]> = {
  g: ["g", 1], gram: ["g", 1], kg: ["g", 1000], kilogram: ["g", 1000],
  oz: ["g", 28.3495], ounce: ["g", 28.3495], lb: ["g", 453.592], pound: ["g", 453.592],
  ml: ["ml", 1], l: ["ml", 1000], liter: ["ml", 1000], litre: ["ml", 1000],
  tsp: ["ml", 4.92892], teaspoon: ["ml", 4.92892], tbsp: ["ml", 14.7868], tablespoon: ["ml", 14.7868],
  cup: ["ml", 236.588],
};

const EPSILON = 1e-6;

function singular(word: string): string {
  return word.endsWith("s") && word.length > 1 ? word.slice(0, -1) : word;
}

function parseNumber(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .reduce((sum, part) => {
      const [a, b] = part.split("/");
      return sum + (b ? Number(a) / Number(b) : Number(a));
    }, 0);
}

/** Reads "1.5 lb", "1 1/2 cups", "4 cloves" or "3". Returns null for "a pinch", "to taste" and the like. */
export function parseAmount(text: string | undefined): Amount | null {
  const head = (text ?? "").toLowerCase().split(",")[0].replace(/\(.*?\)/g, "").trim();
  const m = head.match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d*\.?\d+)\s*([a-z]+)?/);
  if (!m) return null;
  const value = parseNumber(m[1]);
  const word = m[2] ? singular(m[2]) : "";
  const known = UNITS[m[2] ?? ""] ?? UNITS[word];
  if (known) return { value, family: known[0], factor: known[1], unitText: m[2] ?? "" };
  // An unrecognised word ("2 eggs") is just naming the thing, so it counts as a bare number.
  return { value, family: "count:", factor: 1, unitText: "" };
}

/** Containers and pieces: "1 bag" is not the same kind of amount as a bare "1". */
const COUNT_UNITS = ["clove", "slice", "can", "stalk", "head", "bunch", "sprig", "leaf", "piece", "bag", "box", "bottle", "jar", "pack", "package", "carton", "loaf", "bulb", "container", "tub", "stick"];

function isCountUnit(word: string): boolean {
  return COUNT_UNITS.includes(singular(word));
}

/** Like `parseAmount`, but keeps well-known count words ("cloves", "slices") as their own family. */
function parseAmountWithCounts(text: string | undefined): Amount | null {
  const a = parseAmount(text);
  const word = (text ?? "").toLowerCase().match(/^[\d\s./]+\s*([a-z]+)/)?.[1];
  if (a && a.family === "count:" && word && isCountUnit(word)) {
    return { ...a, family: `count:${singular(word)}`, unitText: word };
  }
  return a;
}

function format(value: number, unitText: string): string {
  const rounded = Math.round(value * 100) / 100;
  return unitText ? `${rounded} ${unitText}` : `${rounded}`;
}

export type Subtraction = { kind: "left"; quantity: string } | { kind: "gone" } | null;

/**
 * Takes `used` away from `have`. Null means the two can't be compared (different kinds of unit,
 * or one of them isn't a number); the caller then asks the person.
 */
export function subtract(have: string | undefined, used: string | undefined): Subtraction {
  const a = parseAmountWithCounts(have);
  const b = parseAmountWithCounts(used);
  if (!a || !b || a.family !== b.family) return null;
  const left = (a.value * a.factor - b.value * b.factor) / a.factor;
  return left <= EPSILON ? { kind: "gone" } : { kind: "left", quantity: format(left, a.unitText) };
}
