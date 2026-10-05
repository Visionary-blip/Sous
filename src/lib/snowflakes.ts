export interface Snowflake {
  id: number;
  /** Where along the button it starts, 0 to 100 (%). */
  left: number;
  /** How far it drifts sideways and falls, in px, and how much it spins. */
  dx: number;
  dy: number;
  rot: number;
  size: number;
  /** Animation length in ms. */
  ms: number;
}

/** A burst of tiny flakes for one press; `rand` is injectable so the numbers can be tested. */
export function makeSnowflakes(count: number, firstId: number, rand: () => number = Math.random): Snowflake[] {
  return Array.from({ length: count }, (_, n) => ({
    id: firstId + n,
    left: 10 + rand() * 80,
    dx: (rand() - 0.5) * 70,
    dy: 18 + rand() * 34,
    rot: (rand() - 0.5) * 240,
    size: 8 + Math.round(rand() * 5),
    ms: 700 + Math.round(rand() * 500),
  }));
}
