import { describe, expect, it } from "vitest";
import { formatTime, from12h, nextDinner, takeOutAt, takeOutLabel, thawHours, to12h } from "@/lib/dinner-time";

describe("12-hour conversion", () => {
  it("round-trips, with noon and midnight as 12", () => {
    expect(to12h({ hour: 0, minute: 0 })).toEqual({ hour12: 12, minute: 0, pm: false });
    expect(to12h({ hour: 12, minute: 5 })).toEqual({ hour12: 12, minute: 5, pm: true });
    expect(to12h({ hour: 18, minute: 30 })).toEqual({ hour12: 6, minute: 30, pm: true });
    expect(from12h(12, 0, false)).toEqual({ hour: 0, minute: 0 });
    expect(from12h(12, 0, true)).toEqual({ hour: 12, minute: 0 });
    expect(from12h(6, 30, true)).toEqual({ hour: 18, minute: 30 });
    expect(formatTime({ hour: 18, minute: 5 })).toBe("6:05 PM");
  });
});

describe("nextDinner and takeOutLabel", () => {
  const t = { hour: 18, minute: 0 };

  it("is later today before dinner and tomorrow after it", () => {
    expect(nextDinner(new Date(2026, 9, 4, 12, 0), t)).toEqual(new Date(2026, 9, 4, 18, 0));
    expect(nextDinner(new Date(2026, 9, 4, 19, 0), t)).toEqual(new Date(2026, 9, 5, 18, 0));
    expect(nextDinner(new Date(2026, 9, 4, 18, 0), t)).toEqual(new Date(2026, 9, 5, 18, 0));
  });

  it("labels take-out times as now, today, tomorrow or a weekday", () => {
    const now = new Date(2026, 9, 4, 12, 0);
    expect(takeOutLabel(new Date(2026, 9, 4, 11, 0), now)).toBe("now");
    expect(takeOutLabel(new Date(2026, 9, 4, 15, 30), now)).toBe("today 3:30 PM");
    expect(takeOutLabel(new Date(2026, 9, 5, 9, 0), now)).toBe("tomorrow 9:00 AM");
    expect(takeOutLabel(new Date(2026, 9, 7, 9, 0), now)).toBe("Wed 9:00 AM");
    expect(takeOutAt(new Date(2026, 9, 5, 18, 0), 24)).toEqual(new Date(2026, 9, 4, 18, 0));
  });
});

describe("thawHours", () => {
  it("gives meat a day, shrimp and fish less, bread a few hours, and the group default otherwise", () => {
    expect(thawHours("chicken breast", "Protein")).toBe(24);
    expect(thawHours("ground beef", "Protein")).toBe(24);
    expect(thawHours("shrimp", "Protein")).toBe(8);
    expect(thawHours("salmon", "Protein")).toBe(12);
    expect(thawHours("bread", "Grains & starches")).toBe(3);
    expect(thawHours("mystery", "Vegetables")).toBe(3);
  });
});
