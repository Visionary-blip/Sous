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

  // Keep the dial on the chosen row when the choice changes from outside (a click, a key, a reset).
  useEffect(() => {
    const el = ref.current;
    if (el && Math.round(el.scrollTop / ROW) !== index) el.scrollTo({ top: index * ROW, behavior: "smooth" });
  }, [index]);

  function onScroll() {
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
