import { WheelPicker } from "@/components/wheel-picker";
import { from12h, to12h, type TimeOfDay } from "@/lib/dinner-time";

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
const PERIODS = ["AM", "PM"];

/** Three vertical dials (hour, minute in 5s, AM/PM) for choosing a time of day; used in Settings and in the dinner pop-up. */
export function TimeDials({ time, onChange }: { time: TimeOfDay; onChange: (t: TimeOfDay) => void }) {
  const { hour12, minute, pm } = to12h(time);
  const nearest = Math.min(11, Math.round(minute / 5));
  const set = (h: number, m: number, p: boolean) => onChange(from12h(h, m, p));
  return (
    <div className="wheels">
      <WheelPicker label="Hour" options={HOURS} index={hour12 - 1} onIndex={(i) => set(i + 1, minute, pm)} />
      <span className="wheel-colon">:</span>
      <WheelPicker label="Minute" options={MINUTES} index={nearest} onIndex={(i) => set(hour12, i * 5, pm)} />
      <WheelPicker label="AM or PM" options={PERIODS} index={pm ? 1 : 0} onIndex={(i) => set(hour12, minute, i === 1)} />
    </div>
  );
}
