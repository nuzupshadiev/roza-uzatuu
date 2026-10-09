import { translations } from "@/data/translations";

/** The celebration is always read in Bishkek time, wherever the guest is. */
export const EVENT_TIME_ZONE_OFFSET = "+06:00";

interface DateParts {
  year: number;
  /** 1–12 */
  month: number;
  day: number;
}

/**
 * Splits a `YYYY-MM-DD` string without going through `Date`, so a date-only
 * value can never slip to the previous day in a western timezone.
 */
export function parseEventDate(date: string): DateParts {
  const [year, month, day] = date.split("-").map(Number);
  return { year, month, day };
}

/** Milliseconds of `date` + `startTime` in Asia/Bishkek. */
export function eventTimestamp(date: string, startTime: string): number {
  return Date.parse(`${date}T${startTime}:00${EVENT_TIME_ZONE_OFFSET}`);
}

/** Kyrgyz month name of the event date, e.g. `Ноябрь`. */
export function monthName(date: string): string {
  return translations.date.months[parseEventDate(date).month - 1];
}

export function eventYear(date: string): number {
  return parseEventDate(date).year;
}

export function eventDay(date: string): number {
  return parseEventDate(date).day;
}

/** `16:00` → `16:00`, tolerating `7:5` style input. */
export function formatTime(startTime: string): string {
  const [hours, minutes] = startTime.split(":");
  return `${hours.padStart(2, "0")}:${(minutes ?? "00").padStart(2, "0")}`;
}

export interface CalendarCell {
  day: number | null;
  /** Weekday index, 0 = Monday. */
  weekday: number;
}

/**
 * Month grid for the event's month, Monday first, matching the reference
 * calendar card. Uses UTC arithmetic only, so it renders the same everywhere.
 */
export function monthGrid(date: string): CalendarCell[] {
  const { year, month, day } = parseEventDate(date);
  void day;
  const first = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const leading = (first.getUTCDay() + 6) % 7;

  const cells: CalendarCell[] = [];
  for (let index = 0; index < leading; index += 1) {
    cells.push({ day: null, weekday: index });
  }
  for (let dayOfMonth = 1; dayOfMonth <= daysInMonth; dayOfMonth += 1) {
    cells.push({ day: dayOfMonth, weekday: (leading + dayOfMonth - 1) % 7 });
  }
  return cells;
}

export interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  finished: boolean;
}

export function remainingUntil(target: number, now: number): Remaining {
  const delta = Math.max(0, target - now);
  return {
    days: Math.floor(delta / 86_400_000),
    hours: Math.floor((delta / 3_600_000) % 24),
    minutes: Math.floor((delta / 60_000) % 60),
    seconds: Math.floor((delta / 1000) % 60),
    finished: delta === 0,
  };
}
