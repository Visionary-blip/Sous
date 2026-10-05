import { useEffect, useState } from "react";
import { TimeDials } from "@/components/time-dials";
import { formatTime, type TimeOfDay } from "@/lib/dinner-time";

interface Props {
  dish: string;
  /** The dinnertime to start on: the plan's time if one exists, otherwise the profile's. */
  start: TimeOfDay;
  planned: boolean;
  onConfirm: (t: TimeOfDay) => void;
  onCancelPlan: () => void;
  onClose: () => void;
}

/** The pop-up behind the pot button: turn the dials to the dinner time for this meal. */
export function DinnerDialog({ dish, start, planned, onConfirm, onCancelPlan, onClose }: Props) {
  const [time, setTime] = useState(start);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="dinner-backdrop" onClick={onClose}>
      <div className="dinner-modal" role="dialog" aria-modal="true" aria-label={`Dinner time for ${dish}`} onClick={(e) => e.stopPropagation()}>
        <h2>When is dinner?</h2>
        <p className="dinner-sub">{dish} uses food that is usually frozen. Sous will say when to take it out.</p>
        <TimeDials time={time} onChange={setTime} />
        <div className="dinner-actions">
          <button type="button" className="primary" onClick={() => onConfirm(time)}>
            {planned ? "Update" : "Plan it"} for {formatTime(time)}
          </button>
          {planned && <button type="button" onClick={onCancelPlan}>Not cooking</button>}
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
