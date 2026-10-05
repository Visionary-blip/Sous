import { useState } from "react";
import { FOOD_GROUPS, guessGroup } from "../lib/food-groups";
import { expiryLabel, expiryText } from "../lib/expiry";
import { FreezeButton } from "@/components/freeze-button";
import { FreezerBank } from "@/components/freezer-bank";
import { assumedExpiry, assumedFrozenDays, assumedFrozenExpiry } from "../lib/shelf-life";
import { newId, todayIso } from "../lib/storage";
import type { FoodGroup, GroceryItem } from "../types";

interface Props {
  groceries: GroceryItem[];
  setGroceries: (fn: (prev: GroceryItem[]) => GroceryItem[]) => void;
}

function freezerDays(name: string, group: FoodGroup | null): number {
  return assumedFrozenDays(name, group ?? guessGroup(name));
}

function freezeHint(freezing: boolean, names: string[], group: FoodGroup | null): string {
  if (!freezing) return "Freeze, then Add, to file it under Freezer with a longer estimate.";
  const days = names.length === 1 ? ` (about ${freezerDays(names[0], group)} days)` : "";
  return `Add will file it under Freezer${days}.`;
}

function dateHint(count: number, picked: boolean): string {
  if (picked) return "Your date.";
  if (count === 0) return "Sous estimates a use-by date from what you type. Change it here if it's wrong.";
  return count === 1 ? "Estimated. Pick a different date if it's wrong." : "Each item gets its own estimate. Pick a date to use one date for all.";
}

export function Pantry({ groceries, setGroceries }: Props) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  // null means "let Sous guess from the name"; picking one overrides the guess.
  const [group, setGroup] = useState<FoodGroup | null>(null);
  const [expiresOn, setExpiresOn] = useState("");
  // Freeze only chooses where the next Add files the item; nothing is logged until Add is pressed.
  const [freezing, setFreezing] = useState(false);
  const today = new Date();
  // Allow adding several at once: "eggs, milk, spinach".
  const names = name
    .split(",")
    .map((n) => n.trim())
    .filter(Boolean);
  const estimateFor = (n: string, frozen = false) => (frozen ? assumedFrozenExpiry : assumedExpiry)(n, group ?? guessGroup(n), todayIso());
  // With one item the box shows its estimate; with several, each gets its own unless a date is picked.
  const shownDate = expiresOn || (names.length === 1 ? estimateFor(names[0], freezing) : "");
  const shown = shownDate ? expiryText(shownDate, today) : null;

  // With Freeze on, the same item goes into the Freezer bank with a much later estimated use-by date.
  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!names.length) return;
    const frozen = freezing;
    const added: GroceryItem[] = names.map((n) => ({
      id: newId(),
      name: n,
      group: group ?? guessGroup(n),
      quantity: names.length === 1 && quantity.trim() ? quantity.trim() : undefined,
      expiresOn: expiresOn || estimateFor(n, frozen),
      expiryEstimated: expiresOn ? undefined : true,
      frozen: frozen || undefined,
      addedOn: todayIso(),
    }));
    setGroceries((prev) => [...added, ...prev]);
    setName("");
    setQuantity("");
    setExpiresOn("");
    setGroup(null);
    setFreezing(false);
  }

  function remove(id: string) {
    setGroceries((prev) => prev.filter((g) => g.id !== id));
  }

  function move(id: string, to: FoodGroup) {
    setGroceries((prev) => prev.map((g) => (g.id === id ? { ...g, group: to } : g)));
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
            <span>Group</span>
            <select value={group ?? ""} onChange={(e) => setGroup((e.target.value || null) as FoodGroup | null)}>
              <option value="">Auto</option>
              {FOOD_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Qty</span>
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="optional" />
          </label>
        </div>
        <label className="field">
          <span>Use by</span>
          <input
            type="date"
            className={`date-field ${shown?.tone ?? ""}`}
            value={shownDate}
            onChange={(e) => setExpiresOn(e.target.value)}
          />
          <span className="date-note">
            {shown && <span className={`badge ${shown.tone}`}>{shown.text}</span>}
            <small className="muted">{dateHint(names.length, Boolean(expiresOn))}</small>
          </span>
        </label>
        <button className="primary" type="submit" disabled={!name.trim()}>
          Add
        </button>
        <FreezeButton on={freezing} onToggle={() => setFreezing(!freezing)} />
        <small className="muted">{freezeHint(freezing, names, group)}</small>
      </form>

      {groceries.length === 0 && (
        <p className="empty">
          Your fridge is empty. Add what you have — fridge, freezer or shelves — to get recipe ideas.
        </p>
      )}

      {FOOD_GROUPS.map((group) => {
        const items = groceries.filter((g) => g.group === group && !g.frozen).sort(byExpiry);
        if (!items.length) return null;
        return (
          <div key={group} className="group">
            <h2>
              {group} <span className="count">{items.length}</span>
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
                      {exp && g.expiryEstimated && <span className="muted"> est.</span>}
                    </div>
                    <select
                      className="small"
                      value={g.group}
                      onChange={(e) => move(g.id, e.target.value as FoodGroup)}
                      aria-label={`Move ${g.name}`}
                    >
                      {FOOD_GROUPS.map((fg) => (
                        <option key={fg} value={fg}>
                          {fg}
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
      <FreezerBank items={groceries.filter((g) => g.frozen).sort(byExpiry)} today={today} onRemove={remove} />
    </section>
  );
}
