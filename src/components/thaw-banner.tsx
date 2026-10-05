import type { RecipeMatch } from "@/lib/match";
import { thawNeeded } from "@/lib/thaw";
import type { useExpiryAlerts } from "@/lib/use-expiry-alerts";

interface Props {
  /** Matches for the dishes the person planned to cook. */
  planned: RecipeMatch[];
  alerts: ReturnType<typeof useExpiryAlerts>;
  onDone: (id: string) => void;
}

/** A reminder for each planned dish that needs something out of the freezer; the same style as the use-by notice. */
export function ThawBanner({ planned, alerts, onDone }: Props) {
  const rows = planned.map((m) => ({ m, thaw: thawNeeded(m) })).filter((r) => r.thaw.length > 0);
  if (rows.length === 0) return null;
  return (
    <>
      {rows.map(({ m, thaw }) => (
        <div key={m.recipe.id} className="expiry-banner thaw" role="status">
          <p>
            <strong>Thaw for {m.recipe.title}:</strong> {thaw.map((t) => t.name).join(", ")} (in the freezer)
          </p>
          <div className="expiry-actions">
            {alerts.permission === "default" && <button type="button" onClick={alerts.enable}>Turn on alerts</button>}
            <button type="button" onClick={() => onDone(m.recipe.id)}>Done</button>
          </div>
        </div>
      ))}
    </>
  );
}
