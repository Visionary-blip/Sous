import { useState } from "react";
import { daysUntil } from "../lib/match";
import { newId, todayIso } from "../lib/storage";
import type { GroceryItem, Location } from "../types";

const LOCATIONS: { id: Location; label: string }[] = [
  { id: "fridge", label: "Fridge" },
  { id: "freezer", label: "Freezer" },
  { id: "pantry", label: "Pantry shelf" },
];

function expiryLabel(item: GroceryItem, today: Date): { text: string; tone: string } | null {
  if (!item.expiresOn) return null;
  const days = daysUntil(item.expiresOn, today);
  if (days < 0) return { text: `Expired ${-days}d ago`, tone: "danger" };
  if (days === 0) return { text: "Use today", tone: "danger" };
  if (days === 1) return { text: "Use by tomorrow", tone: "warn" };
  if (days <= 3) return { text: `Use within ${days} days`, tone: "warn" };
  return { text: `Good for ${days} days`, tone: "ok" };
}

interface Props {
  groceries: GroceryItem[];
  setGroceries: (fn: (prev: GroceryItem[]) => GroceryItem[]) => void;
}

export function Kitchen({ groceries, setGroceries }: Props) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState<Location>("fridge");
  const [expiresOn, setExpiresOn] = useState("");
  const today = new Date();

  function add(e: React.FormEvent) {
    e.preventDefault();
    // Allow adding several at once: "eggs, milk, spinach".
    const names = name
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    if (!names.length) return;
    const added: GroceryItem[] = names.map((n) => ({
      id: newId(),
      name: n,
      location,
      quantity: names.length === 1 && quantity.trim() ? quantity.trim() : undefined,
      expiresOn: expiresOn || undefined,
      addedOn: todayIso(),
    }));
    setGroceries((prev) => [...added, ...prev]);
    setName("");
    setQuantity("");
    setExpiresOn("");
  }

  function remove(id: string) {
    setGroceries((prev) => prev.filter((g) => g.id !== id));
  }

  function move(id: string, to: Location) {
    setGroceries((prev) => prev.map((g) => (g.id === id ? { ...g, location: to } : g)));
  }

  const byExpiry = (a: GroceryItem, b: GroceryItem) =>
    (a.expiresOn ?? "9999").localeCompare(b.expiresOn ?? "9999") || a.name.localeCompare(b.name);

  return (
    <section>
      <form className="card add-form" onSubmit={add}>
        <label className="field grow">
          <span>Add groceries</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. eggs, spinach, chicken thighs"
            aria-label="Grocery name"
          />
        </label>
        <div className="row">
          <label className="field">
            <span>Where</span>
            <select value={location} onChange={(e) => setLocation(e.target.value as Location)}>
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Qty</span>
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="optional" />
          </label>
          <label className="field">
            <span>Use by</span>
            <input type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} />
          </label>
        </div>
        <button className="primary" type="submit" disabled={!name.trim()}>
          Add
        </button>
      </form>

      {groceries.length === 0 && (
        <p className="empty">
          Your kitchen is empty. Add what's in your fridge, freezer and pantry to get recipe ideas.
        </p>
      )}

      {LOCATIONS.map((loc) => {
        const items = groceries.filter((g) => g.location === loc.id).sort(byExpiry);
        if (!items.length) return null;
        return (
          <div key={loc.id} className="group">
            <h2>
              {loc.label} <span className="count">{items.length}</span>
            </h2>
            <ul className="list">
              {items.map((g) => {
                const exp = expiryLabel(g, today);
                return (
                  <li key={g.id} className="list-item">
                    <div className="grow">
                      <div className="item-name">
                        {g.name}
                        {g.quantity && <span className="muted"> · {g.quantity}</span>}
                      </div>
                      {exp && <span className={`badge ${exp.tone}`}>{exp.text}</span>}
                    </div>
                    <select
                      className="small"
                      value={g.location}
                      onChange={(e) => move(g.id, e.target.value as Location)}
                      aria-label={`Move ${g.name}`}
                    >
                      {LOCATIONS.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.label}
                        </option>
                      ))}
                    </select>
                    <button className="icon" onClick={() => remove(g.id)} aria-label={`Remove ${g.name}`} title="Used up / remove">
                      ✓
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
