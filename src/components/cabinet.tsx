import { useState } from "react";
import { STAPLE_CATEGORIES } from "@/data/staples";
import { normalize } from "@/lib/ingredients";
import { newId } from "@/lib/storage";
import type { Staple } from "@/types";

// Custom staples land here now that the add form has no category picker.
const NEW_STAPLE_CATEGORY = "Spices";

/** "Sauces & Condiments" becomes "sauces", the hook for that category's colour in the stylesheet. */
function colorClass(category: string): string {
  return category.split(" ")[0].toLowerCase();
}

interface Props {
  staples: Staple[];
  setStaples: (fn: (prev: Staple[]) => Staple[]) => void;
}

export function Cabinet({ staples, setStaples }: Props) {
  const [name, setName] = useState("");

  function toggle(id: string) {
    setStaples((prev) => prev.map((s) => (s.id === id ? { ...s, inStock: !s.inStock } : s)));
  }

  function add(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n) return;
    const existing = staples.find((s) => normalize(s.name) === normalize(n));
    if (existing) {
      setStaples((prev) => prev.map((s) => (s.id === existing.id ? { ...s, inStock: true } : s)));
    } else {
      setStaples((prev) => [...prev, { id: newId(), name: n, category: NEW_STAPLE_CATEGORY, inStock: true }]);
    }
    setName("");
  }

  function remove(id: string) {
    setStaples((prev) => prev.filter((s) => s.id !== id));
  }

  const inStock = staples.filter((s) => s.inStock).length;

  return (
    <section>
      <p className="intro">
        <strong>{inStock}</strong> {inStock === 1 ? "Item" : "Items"} in Cabinet
      </p>

      <form className="card add-form" onSubmit={add}>
        <label className="field grow">
          <span>Add a staple</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Za'atar" />
        </label>
        <button className="primary" type="submit" disabled={!name.trim()}>
          Add
        </button>
      </form>

      {STAPLE_CATEGORIES.map((cat) => {
        const items = staples
          .filter((s) => s.category === cat)
          .sort((a, b) => a.name.localeCompare(b.name));
        if (!items.length) return null;
        const have = items.filter((s) => s.inStock).length;
        return (
          <div key={cat} className={`group cat-${colorClass(cat)}`}>
            <h2>
              {cat}{" "}
              <span className="count">
                {have}/{items.length}
              </span>
            </h2>
            <div className="chips">
              {items.map((s) => (
                <span key={s.id} className={`chip ${s.inStock ? "on" : ""}`}>
                  <button type="button" onClick={() => toggle(s.id)} aria-pressed={s.inStock}>
                    {s.inStock ? "✓ " : ""}
                    {s.name}
                  </button>
                  {!s.id.startsWith("staple-") && (
                    <button type="button" className="chip-x" onClick={() => remove(s.id)} aria-label={`Delete ${s.name}`}>
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
