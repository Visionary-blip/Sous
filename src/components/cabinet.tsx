import { useState } from "react";
import { STAPLE_CATEGORIES } from "../data/staples";
import { normalize } from "../lib/ingredients";
import { newId } from "../lib/storage";
import type { Staple, StapleCategory } from "../types";

interface Props {
  staples: Staple[];
  setStaples: (fn: (prev: Staple[]) => Staple[]) => void;
}

export function Cabinet({ staples, setStaples }: Props) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<StapleCategory>("Spices");
  const [filter, setFilter] = useState("");

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
      setStaples((prev) => [...prev, { id: newId(), name: n, category, inStock: true }]);
    }
    setName("");
  }

  function remove(id: string) {
    setStaples((prev) => prev.filter((s) => s.id !== id));
  }

  const inStock = staples.filter((s) => s.inStock).length;
  const q = filter.trim().toLowerCase();

  return (
    <section>
      <p className="intro">
        Your staples bank: the spices, seasonings and sauces you usually keep around. Tap to mark what you have —{" "}
        <strong>{inStock}</strong> in stock. Recipes count these automatically.
      </p>

      <form className="card add-form" onSubmit={add}>
        <label className="field grow">
          <span>Add a staple</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Za'atar" />
        </label>
        <div className="row">
          <label className="field">
            <span>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value as StapleCategory)}>
              {STAPLE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <button className="primary" type="submit" disabled={!name.trim()}>
          Add
        </button>
      </form>

      <input
        className="search"
        type="search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter staples…"
        aria-label="Filter staples"
      />

      {STAPLE_CATEGORIES.map((cat) => {
        const items = staples
          .filter((s) => s.category === cat && (!q || s.name.toLowerCase().includes(q)))
          .sort((a, b) => a.name.localeCompare(b.name));
        if (!items.length) return null;
        const have = items.filter((s) => s.inStock).length;
        return (
          <div key={cat} className="group">
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
