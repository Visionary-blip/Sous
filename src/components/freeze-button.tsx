import { useRef, useState, type CSSProperties } from "react";
import { makeSnowflakes, type Snowflake } from "@/lib/snowflakes";

const FLAKES_PER_PRESS = 9;
const MAX_MS = 1300;

/** The Freeze button: pressing it also sprinkles a few tiny snowflakes off the button. */
export function FreezeButton({ disabled, onFreeze }: { disabled: boolean; onFreeze: () => void }) {
  const [flakes, setFlakes] = useState<Snowflake[]>([]);
  const nextId = useRef(0);

  function press() {
    onFreeze();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const burst = makeSnowflakes(FLAKES_PER_PRESS, nextId.current);
    nextId.current += FLAKES_PER_PRESS;
    setFlakes((current) => [...current, ...burst]);
    const ids = new Set(burst.map((f) => f.id));
    window.setTimeout(() => setFlakes((current) => current.filter((f) => !ids.has(f.id))), MAX_MS);
  }

  return (
    <span className="freeze-wrap">
      <button type="button" className="freeze-btn" disabled={disabled} onClick={press}>
        Freeze
      </button>
      <span className="flakes" aria-hidden>
        {flakes.map((f) => (
          <span
            key={f.id}
            className="flake"
            style={{ left: `${f.left}%`, fontSize: f.size, animationDuration: `${f.ms}ms`, "--dx": `${f.dx}px`, "--dy": `${f.dy}px`, "--rot": `${f.rot}deg` } as CSSProperties}
          >
            ❄︎
          </span>
        ))}
      </span>
    </span>
  );
}
