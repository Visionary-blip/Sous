import { TimeDials } from "@/components/time-dials";
import { ASSUMED_DINNER, dinnerTime, formatTime, type TimeOfDay } from "@/lib/dinner-time";
import type { Profile } from "@/lib/profiles";

interface Props {
  profile: Profile;
  onCustom: (custom: boolean) => void;
  onTime: (t: TimeOfDay) => void;
}

/** Settings for dinnertime: use the assumed time, or turn the hour and minute dials to set your own. */
export function DinnerSettings({ profile, onCustom, onTime }: Props) {
  const custom = Boolean(profile.dinner?.custom);
  return (
    <div className="set-block">
      <h3>Dinner time · {profile.name}</h3>
      <div className="set-profiles">
        <button type="button" className={custom ? "" : "on"} aria-pressed={!custom} onClick={() => onCustom(false)}>
          Assumed · {formatTime(ASSUMED_DINNER)}
        </button>
        <button type="button" className={custom ? "on" : ""} aria-pressed={custom} onClick={() => onCustom(true)}>
          Set my own
        </button>
      </div>
      {custom && <TimeDials time={dinnerTime(profile.dinner)} onChange={onTime} />}
      <small>
        Dinner is at {formatTime(dinnerTime(profile.dinner))}. This is the time the dinner pop-up starts on when you press the pot on a dish that uses frozen-type food; you can change it there for that one meal.
      </small>
    </div>
  );
}
