import { SITE } from "@/lib/site";

export const SLOT_MINUTES = 30;
/** How far ahead customers can book online. */
export const BOOKING_WINDOW_DAYS = 60;

export type BookingValues = {
  serviceId: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  notes: string;
};

export type BookingField = keyof BookingValues;

export type BookingConfirmation = {
  serviceName: string;
  priceLabel: string;
  date: string;
  time: string;
  name: string;
  phone: string;
};

export type BookingState =
  | { status: "idle" }
  | {
      status: "error";
      message: string;
      fieldErrors: Partial<Record<BookingField, string>>;
      values: BookingValues;
    }
  | { status: "success"; booking: BookingConfirmation };

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** Bookable start times ("HH:MM", 24h) during opening hours. */
export const TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  const last = toMinutes(SITE.hours.close) - SLOT_MINUTES;
  for (let t = toMinutes(SITE.hours.open); t <= last; t += SLOT_MINUTES) {
    slots.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  }
  return slots;
})();

/** Today's date ("YYYY-MM-DD") and minutes since midnight in the salon's time zone. */
export function salonNow(now = new Date()): { date: string; minutes: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: SITE.timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((p) => [p.type, p.value]),
  );
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

export function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

/** Whether a slot can still be booked, given the salon's current date/time. */
export function isSlotAvailable(date: string, time: string, now: { date: string; minutes: number }): boolean {
  if (!TIME_SLOTS.includes(time)) return false;
  if (date < now.date) return false;
  // Same-day bookings need at least one slot of notice.
  if (date === now.date) return toMinutes(time) >= now.minutes + SLOT_MINUTES;
  return true;
}

/**
 * Normalises Pakistani mobile numbers to +92XXXXXXXXXX.
 * Accepts 03XXXXXXXXX, 3XXXXXXXXX, 923XXXXXXXXX and +92 3XX XXXXXXX (spaces/dashes allowed).
 */
export function normalizePkPhone(input: string): string | null {
  const digits = input.replace(/[\s\-()]/g, "").replace(/^\+/, "");
  const match = digits.match(/^(?:92|0)?(3\d{9})$/);
  return match ? `+92${match[1]}` : null;
}

export function formatBookingDate(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-PK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(y, m - 1, d)));
}
