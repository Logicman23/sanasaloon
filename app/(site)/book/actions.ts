"use server";

import {
  addDays,
  BOOKING_WINDOW_DAYS,
  isSlotAvailable,
  normalizePkPhone,
  salonNow,
  type BookingField,
  type BookingState,
  type BookingValues,
} from "@/lib/booking";
import { displayPrice } from "@/lib/format";
import { getActiveServices } from "@/lib/services";
import { createPublicClient, SupabaseConfigError } from "@/utils/supabase/server";

const FALLBACK_MESSAGE =
  "We couldn't save your booking right now. Please try again in a moment, or call/WhatsApp us to book.";

export async function createBooking(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const field = (name: string) => String(formData.get(name) ?? "").trim();
  const values: BookingValues = {
    serviceId: field("serviceId"),
    date: field("date"),
    time: field("time"),
    name: field("name").replace(/\s+/g, " "),
    phone: field("phone"),
    notes: field("notes"),
  };

  // Honeypot: real visitors never see or fill this field. Pretend success so bots don't retry.
  if (field("website")) {
    return { status: "success", booking: { serviceName: "", priceLabel: "", date: "", time: "", name: "", phone: "" } };
  }

  const fieldErrors: Partial<Record<BookingField, string>> = {};
  const fail = (message = "Please check the highlighted fields.") =>
    ({ status: "error", message, fieldErrors, values }) as const;

  const servicesResult = await getActiveServices();
  if (!servicesResult.ok) return fail(FALLBACK_MESSAGE);
  const service = servicesResult.services.find((s) => s.id === values.serviceId);
  if (!service) fieldErrors.serviceId = "Please choose a service.";

  const now = salonNow();
  const lastDate = addDays(now.date, BOOKING_WINDOW_DAYS);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date)) {
    fieldErrors.date = "Please pick a date.";
  } else if (values.date < now.date || values.date > lastDate) {
    fieldErrors.date = `Please pick a date within the next ${BOOKING_WINDOW_DAYS} days.`;
  }

  if (!values.time) {
    fieldErrors.time = "Please pick a time.";
  } else if (!fieldErrors.date && !isSlotAvailable(values.date, values.time, now)) {
    fieldErrors.time = "That time isn't available. Please choose one of the listed times.";
  }

  if (values.name.length < 2 || values.name.length > 80) {
    fieldErrors.name = "Please enter your full name.";
  }

  const phone = normalizePkPhone(values.phone);
  if (!phone) fieldErrors.phone = "Please enter a valid mobile number, e.g. 0300 1234567.";

  if (values.notes.length > 500) fieldErrors.notes = "Please keep notes under 500 characters.";

  if (Object.keys(fieldErrors).length > 0 || !service || !phone) return fail();

  try {
    const supabase = createPublicClient();
    const { error } = await supabase.from("appointments").insert({
      // POS-sourced ids aren't rows in this database; the name and price snapshot still record the choice.
      service_id: servicesResult.source === "website" ? service.id : null,
      service_name: service.name,
      price_display: displayPrice(service),
      customer_name: values.name,
      customer_phone: phone,
      appointment_date: values.date,
      appointment_time: values.time,
      notes: values.notes || null,
      status: "pending",
      source: "website",
    });

    if (error) {
      console.error("[booking] Insert failed:", error.code, error.message);
      return fail(FALLBACK_MESSAGE);
    }
  } catch (err) {
    if (err instanceof SupabaseConfigError) console.error(`[booking] ${err.message}`);
    else console.error("[booking] Unexpected error:", err);
    return fail(FALLBACK_MESSAGE);
  }

  return {
    status: "success",
    booking: {
      serviceName: service.name,
      priceLabel: displayPrice(service),
      date: values.date,
      time: values.time,
      name: values.name,
      phone,
    },
  };
}
