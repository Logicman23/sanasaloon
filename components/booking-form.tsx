"use client";

import { CalendarCheck, CalendarHeart, CircleAlert, LoaderCircle, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";
import { createBooking } from "@/app/book/actions";
import {
  addDays,
  BOOKING_WINDOW_DAYS,
  formatBookingDate,
  isSlotAvailable,
  TIME_SLOTS,
  type BookingConfirmation,
  type BookingField,
  type BookingState,
} from "@/lib/booking";
import { displayPrice, formatDuration, formatTime12h } from "@/lib/format";
import { whatsappLink } from "@/lib/site";
import type { Service } from "@/lib/types";

type Props = {
  services: Service[];
  categories: string[];
  initialServiceId?: string;
  /** Salon-local "now", computed on the server so the time zone is always Asia/Karachi. */
  now: { date: string; minutes: number };
};

export function BookingForm(props: Props) {
  // Changing the key remounts the form with a fresh action state ("Book another").
  const [attempt, setAttempt] = useState(0);
  return <BookingFormInner key={attempt} {...props} onReset={() => setAttempt((n) => n + 1)} />;
}

function BookingFormInner({ services, categories, initialServiceId, now, onReset }: Props & { onReset: () => void }) {
  const [state, formAction, pending] = useActionState<BookingState, FormData>(createBooking, { status: "idle" });

  // Selects are controlled so they survive React's post-submit form reset; text inputs
  // are restored from the returned values via defaultValue.
  const previous = state.status === "error" ? state.values : undefined;
  const [serviceId, setServiceId] = useState(initialServiceId ?? "");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  if (state.status === "success") return <BookingSuccess booking={state.booking} onReset={onReset} />;

  const errors: Partial<Record<BookingField, string>> = state.status === "error" ? state.fieldErrors : {};
  const selected = services.find((s) => s.id === serviceId);
  const slots = date ? TIME_SLOTS.filter((t) => isSlotAvailable(date, t, now)) : TIME_SLOTS;
  const timeValue = slots.includes(time) ? time : "";

  return (
    <form action={formAction} noValidate className="space-y-6">
      {state.status === "error" && (
        <div role="alert" className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p>{state.message}</p>
        </div>
      )}

      <Field label="Service" htmlFor="serviceId" error={errors.serviceId}>
        <select
          id="serviceId"
          name="serviceId"
          required
          value={serviceId}
          onChange={(e) => setServiceId(e.target.value)}
          aria-invalid={!!errors.serviceId}
          aria-describedby={errors.serviceId ? "serviceId-error" : undefined}
          className={inputClass(errors.serviceId)}
        >
          <option value="" disabled>
            Choose a service…
          </option>
          {categories.map((category) => (
            <optgroup key={category} label={category}>
              {services
                .filter((s) => s.category === category)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {displayPrice(s)}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        {selected && (
          <p className="mt-2 text-sm text-ink/60">
            {[displayPrice(selected), formatDuration(selected.duration_minutes)].filter(Boolean).join(" · ")}
          </p>
        )}
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Date" htmlFor="date" error={errors.date}>
          <input
            id="date"
            name="date"
            type="date"
            required
            min={now.date}
            max={addDays(now.date, BOOKING_WINDOW_DAYS)}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? "date-error" : undefined}
            className={inputClass(errors.date)}
          />
        </Field>

        <Field label="Time" htmlFor="time" error={errors.time}>
          <select
            id="time"
            name="time"
            required
            value={timeValue}
            onChange={(e) => setTime(e.target.value)}
            disabled={!!date && slots.length === 0}
            aria-invalid={!!errors.time}
            aria-describedby={errors.time ? "time-error" : undefined}
            className={inputClass(errors.time)}
          >
            <option value="" disabled>
              {date && slots.length === 0 ? "Fully booked today, pick another date" : "Choose a time…"}
            </option>
            {slots.map((t) => (
              <option key={t} value={t}>
                {formatTime12h(t)}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name" error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            maxLength={80}
            defaultValue={previous?.name}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            className={inputClass(errors.name)}
          />
        </Field>

        <Field label="Mobile number" htmlFor="phone" error={errors.phone} hint="We'll call or WhatsApp to confirm.">
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0300 1234567"
            required
            defaultValue={previous?.phone}
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
            className={inputClass(errors.phone)}
          />
        </Field>
      </div>

      <Field label="Notes (optional)" htmlFor="notes" error={errors.notes}>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={500}
          placeholder="Event date, preferred stylist, skin or hair concerns…"
          defaultValue={previous?.notes}
          aria-invalid={!!errors.notes}
          className={inputClass(errors.notes)}
        />
      </Field>

      {/* Honeypot for bots. Hidden from people and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-plum-800 px-6 py-3.5 font-semibold text-white shadow-sm transition hover:bg-plum-900 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
      >
        {pending ? (
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <CalendarHeart className="size-5" aria-hidden="true" />
        )}
        {pending ? "Sending request…" : "Request Appointment"}
      </button>
    </form>
  );
}

function BookingSuccess({ booking, onReset }: { booking: BookingConfirmation; onReset: () => void }) {
  const whatsapp = booking.serviceName
    ? whatsappLink(
        `Hi! I just requested ${booking.serviceName} on ${formatBookingDate(booking.date)} at ${formatTime12h(booking.time)}. Name: ${booking.name}.`,
      )
    : null;

  return (
    <div role="status" className="text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-plum-100 text-plum-800">
        <CalendarCheck className="size-8" aria-hidden="true" />
      </span>
      <h2 className="mt-5 font-display text-3xl font-semibold text-plum-900">Request received!</h2>
      <p className="mx-auto mt-2 max-w-md text-ink/65">
        Thank you{booking.name ? `, ${booking.name}` : ""}. Our team will call or WhatsApp you shortly to confirm
        your appointment.
      </p>

      {booking.serviceName && (
        <dl className="mx-auto mt-8 max-w-md divide-y divide-plum-100 rounded-2xl border border-plum-100 bg-plum-50/50 text-left text-sm">
          {[
            ["Service", booking.serviceName],
            ["Price", booking.priceLabel],
            ["Date", formatBookingDate(booking.date)],
            ["Time", formatTime12h(booking.time)],
            ["Phone", booking.phone],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-4 px-5 py-3">
              <dt className="text-ink/55">{label}</dt>
              <dd className="text-right font-medium text-ink">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-semibold text-white transition hover:brightness-95"
          >
            <MessageCircle className="size-5" aria-hidden="true" />
            Confirm on WhatsApp
          </a>
        )}
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-full border border-plum-200 px-5 py-3 font-semibold text-plum-800 transition hover:bg-plum-50"
        >
          Book another
        </button>
        <Link href="/services" className="inline-flex items-center px-5 py-3 font-semibold text-plum-700 hover:text-plum-900">
          Browse services
        </Link>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-semibold text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="mt-2 text-sm text-red-700">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${htmlFor}-hint`} className="mt-2 text-sm text-ink/55">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

function inputClass(error?: string) {
  return `block w-full rounded-xl border bg-white px-4 py-3 text-ink shadow-sm outline-none transition placeholder:text-ink/35 focus:ring-4 disabled:bg-plum-50 disabled:text-ink/50 ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-plum-200 focus:border-plum-500 focus:ring-plum-100"
  }`;
}
