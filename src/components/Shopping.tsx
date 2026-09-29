import { useState } from "react";
import type { ShoppingItem } from "../types";

interface Props {
  items: ShoppingItem[];
  setItems: (fn: (prev: ShoppingItem[]) => ShoppingItem[]) => void;
  onAdd: (names: string[]) => void;
  /** Move checked items into the kitchen. */
  onStock: (items: ShoppingItem[]) => void;
}

export function Shopping({ items, setItems, onAdd, onStock }: Props) {
  const [name, setName] = useState("");
  const done = items.filter((i) => i.done);

  function add(e: React.FormEvent) {
    e.preventDefault();
    const names = name
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length) onAdd(names);
    setName("");
  }

  return (
    <section>
      <form className="card add-form inline" onSubmit={add}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add to list…" aria-label="Shopping item" className="grow" />
        <button className="primary" type="submit" disabled={!name.trim()}>
          Add
        </button>
      </form>

      {items.length === 0 ? (
        <p className="empty">Your shopping list is empty. Add missing ingredients from any recipe.</p>
      ) : (
        <ul className="list">
          {items.map((i) => (
            <li key={i.id} className={`list-item ${i.done ? "done" : ""}`}>
              <label className="check grow">
                <input
                  type="checkbox"
                  checked={i.done}
                  onChange={() => setItems((prev) => prev.map((x) => (x.id === i.id ? { ...x, done: !x.done } : x)))}
                />
                <span>{i.name}</span>
              </label>
              <button className="icon" onClick={() => setItems((prev) => prev.filter((x) => x.id !== i.id))} aria-label={`Remove ${i.name}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      {done.length > 0 && (
        <div className="actions">
          <button className="primary" onClick={() => onStock(done)}>
            Put {done.length} checked {done.length === 1 ? "item" : "items"} away
          </button>
          <button onClick={() => setItems((prev) => prev.filter((x) => !x.done))}>Clear checked</button>
        </div>
      )}
    </section>
  );
}
