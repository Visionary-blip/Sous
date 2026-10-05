import { useEffect, useRef, type KeyboardEvent } from "react";

const ROW = 36;

interface Props {
  options: string[];
  index: number;
  onIndex: (index: number) => void;
  label: string;
}

/** A vertical dial: scroll or arrow-key the list and the row on the highlight band is the choice. */
export function WheelPicker({ options, index, onIndex, label }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<number | undefined>(undefined);
  // While Sous itself is moving the dial, scroll events must not be read back as the person's choice.
  const moving = useRef(false);
  const mounted = useRef(false);

  // Keep the dial on the chosen row when the choice changes from outside (a click, a key, a reset).
  useEffect(() => {
    const el = ref.current;
    if (!el || Math.round(el.scrollTop / ROW) === index) return;
    moving.current = true;
    window.setTimeout(() => (moving.current = false), 500);
    el.scrollTo({ top: index * ROW, behavior: mounted.current ? "smooth" : "auto" });
    mounted.current = true;
  }, [index]);

  function onScroll() {
    if (moving.current) return;
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      const picked = Math.min(options.length - 1, Math.max(0, Math.round((ref.current?.scrollTop ?? 0) / ROW)));
      if (picked !== index) onIndex(picked);
    }, 80);
  }

  function onKey(e: KeyboardEvent) {
    const step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    onIndex(Math.min(options.length - 1, Math.max(0, index + step)));
  }

  return (
    <div className="wheel">
      <div ref={ref} className="wheel-list" role="listbox" aria-label={label} tabIndex={0} onScroll={onScroll} onKeyDown={onKey}>
        {options.map((o, i) => (
          <div key={o} role="option" aria-selected={i === index} className={`wheel-row ${i === index ? "on" : ""}`} onClick={() => onIndex(i)}>
            {o}
          </div>
        ))}
      </div>
      <div className="wheel-band" aria-hidden />
    </div>
  );
}
