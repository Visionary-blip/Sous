import { takeOutLabel } from "@/lib/dinner-time";
import type { ThawStep } from "@/lib/thaw";
import type { useExpiryAlerts } from "@/lib/use-expiry-alerts";

export interface ThawBannerRow {
  id: string;
  dish: string;
  steps: ThawStep[];
}

interface Props {
  rows: ThawBannerRow[];
  now: Date;
  alerts: ReturnType<typeof useExpiryAlerts>;
  /** "It's out": the person took these items out of the freezer. */
  onOut: (steps: ThawStep[], dish: string) => void;
  onCancel: (id: string) => void;
}

/** A reminder for each planned dish that needs something out of the freezer, with when to take it out. */
export function ThawBanner({ rows, now, alerts, onOut, onCancel }: Props) {
  if (rows.length === 0) return null;
  return (
    <>
      {rows.map(({ id, dish, steps }) => (
        <div key={id} className="expiry-banner thaw" role="status">
          <p>
            <strong>Thaw for {dish}:</strong>{" "}
            {steps.map((s) => `${s.item.name} (take out ${takeOutLabel(s.outAt, now)}, about ${s.hours} h)`).join("; ")}
          </p>
          <div className="expiry-actions">
            <button type="button" onClick={() => onOut(steps, dish)}>It's out</button>
            {alerts.permission === "default" && <button type="button" onClick={alerts.enable}>Turn on alerts</button>}
            <button type="button" onClick={() => onCancel(id)}>Not cooking</button>
          </div>
        </div>
      ))}
    </>
  );
}
