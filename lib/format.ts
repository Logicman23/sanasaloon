import type { Service } from "@/lib/types";

const pkr = new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 });

export function formatRupees(amount: number): string {
  return `Rs. ${pkr.format(amount)}`;
}

/** Prefers the hand-written `price_display` (e.g. ranges), then falls back to the numeric price. */
export function displayPrice(service: Pick<Service, "price" | "price_display">): string {
  if (service.price_display?.trim()) return service.price_display.trim();
  if (service.price != null) return formatRupees(Number(service.price));
  return "Price on consultation";
}

/** "14:30" -> "2:30 PM" */
export function formatTime12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatDuration(minutes: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}
