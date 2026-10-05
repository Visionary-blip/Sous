import { expiryText } from "@/lib/expiry";
import type { useExpiryAlerts } from "@/lib/use-expiry-alerts";

type Alerts = ReturnType<typeof useExpiryAlerts>;

/** A notice under the title listing food due within 2 days, with the choice to turn on system alerts. */
export function ExpiryBanner({ alerts, onFridge }: { alerts: Alerts; onFridge: () => void }) {
  if (alerts.dismissed || alerts.due.length === 0) return null;
  const today = new Date();
  const worst = alerts.due.some((g) => g.expiresOn && expiryText(g.expiresOn, today).tone === "danger") ? "danger" : "warn";
  return (
    <div className={`expiry-banner ${worst}`} role="status">
      <p>
        <strong>{alerts.due.length === 1 ? "1 item" : `${alerts.due.length} items`} due within 2 days:</strong>{" "}
        {alerts.due.map((g) => `${g.name} (${g.expiresOn ? expiryText(g.expiresOn, today).text.toLowerCase() : ""})`).join(", ")}
      </p>
      <div className="expiry-actions">
        <button type="button" onClick={onFridge}>See Fridge</button>
        {alerts.permission === "default" && <button type="button" onClick={alerts.enable}>Turn on alerts</button>}
        <button type="button" onClick={alerts.dismiss}>Dismiss</button>
      </div>
    </div>
  );
}
