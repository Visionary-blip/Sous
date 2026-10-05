import { LockIcon } from "@/components/marks";
import { TimeDials } from "@/components/time-dials";
import { dinnerTime, formatTime, type TimeOfDay } from "@/lib/dinner-time";
import type { Profile } from "@/lib/profiles";

interface Props {
  profile: Profile;
  onLocked: (locked: boolean) => void;
  onTime: (t: TimeOfDay) => void;
}

/** Settings for dinnertime: lock in one time with the padlock, or "set my own" each time the pot is pressed. */
export function DinnerSettings({ profile, onLocked, onTime }: Props) {
  const locked = Boolean(profile.dinner?.locked);
  const time = dinnerTime(profile.dinner);
  return (
    <div className="set-block">
      <h3>Dinner time · {profile.name}</h3>
      <div className="set-profiles">
        <button type="button" className={`lock-btn ${locked ? "on" : ""}`} aria-pressed={locked} onClick={() => onLocked(!locked)}>
          <LockIcon locked={locked} /> {locked ? `Locked in · ${formatTime(time)}` : "Lock in a time"}
        </button>
        <button type="button" className={locked ? "" : "on"} aria-pressed={!locked} onClick={() => onLocked(false)}>
          Set my own
        </button>
      </div>
      {locked && <TimeDials time={time} onChange={onTime} />}
      <small>
        {locked
          ? `Turn the dials to change the locked time. Pressing the pot on a dish that uses frozen-type food plans it for ${formatTime(time)} straight away.`
          : "Pressing the pot on a dish that uses frozen-type food asks you for that meal's dinner time. Lock in a time to skip the question."}
      </small>
    </div>
  );
}
