import { expiryLabel } from "@/lib/expiry";
import type { GroceryItem } from "@/types";

interface Props {
  items: GroceryItem[];
  today: Date;
  onRemove: (id: string) => void;
}

/** The Freezer bank under the fridge list: everything logged with Freeze, with its (much later) use-by date. */
export function FreezerBank({ items, today, onRemove }: Props) {
  if (items.length === 0) return null;
  return (
    <div className="group freezer">
      <h2>
        Freezer <span className="count">{items.length}</span>
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
              <button className="icon" onClick={() => onRemove(g.id)} aria-label={`Remove ${g.name}`} title="Used up / remove">
                ✓
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
