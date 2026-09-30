import { useState } from "react";
import { subtract } from "@/lib/quantity";
import type { GroceryItem } from "@/types";

export interface FinishUpRow {
  id: string;
  /** What the recipe asked for, if it said. */
  needed: string | undefined;
}

interface Props {
  rows: FinishUpRow[];
  groceries: GroceryItem[];
  setGroceries: (fn: (prev: GroceryItem[]) => GroceryItem[]) => void;
  onClose: () => void;
}

/** Lists what Sous couldn't subtract on its own, so the person can remove it or say how much they used. */
export function FinishUp({ rows, groceries, setGroceries, onClose }: Props) {
  const live = rows.flatMap((r) => {
    const item = groceries.find((g) => g.id === r.id);
    return item ? [{ row: r, item }] : [];
  });

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Finish up your pantry">
      <div className="card modal-body">
        <h2 className="screen-title">Finish up</h2>
        <p className="muted">Sous couldn't work these out. Remove each one, or tell it how much you used.</p>
        <ul className="list">
          {live.map(({ row, item }) => (
            <FinishUpItem key={item.id} item={item} needed={row.needed} setGroceries={setGroceries} />
          ))}
          {live.length === 0 && <li className="list-item muted">All done.</li>}
        </ul>
        <button className="primary" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}

interface ItemProps {
  item: GroceryItem;
  needed: string | undefined;
  setGroceries: Props["setGroceries"];
}

function FinishUpItem({ item, needed, setGroceries }: ItemProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  // "left" mode is the fallback when what you used can't be subtracted from what's listed.
  const [mode, setMode] = useState<"used" | "left">("used");

  const update = (quantity: string | null) =>
    setGroceries((prev) => prev.flatMap((g) => (g.id !== item.id ? [g] : quantity === null ? [] : [{ ...g, quantity }])));

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    if (mode === "left") return update(value);
    const result = subtract(item.quantity, value);
    if (!result) return setMode("left");
    update(result.kind === "gone" ? null : result.quantity);
  }

  return (
    <li className="finish-row">
      <div className="finish-head">
        <div className="grow">
          <strong>{item.name}</strong>
          <span className="meta">
            {" "}
            · you have {item.quantity ?? "no amount listed"} · recipe used {needed ?? "no amount given"}
          </span>
        </div>
        <button className="icon" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={`Enter how much ${item.name} you used`}>
          −
        </button>
        <button className="icon" onClick={() => update(null)} aria-label={`Remove ${item.name} from pantry`}>
          ✕
        </button>
      </div>
      {open && (
        <form className="add-form inline" onSubmit={apply}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={mode === "used" ? "How much did you use? e.g. 2" : "Units differ — how much is left?"}
            aria-label={mode === "used" ? `Amount of ${item.name} used` : `Amount of ${item.name} left`}
          />
          <button type="submit" disabled={!text.trim()}>
            {mode === "used" ? "Subtract" : "Set"}
          </button>
        </form>
      )}
    </li>
  );
}
