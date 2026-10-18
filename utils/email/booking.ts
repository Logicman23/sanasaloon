import "server-only";
import nodemailer from "nodemailer";
import { formatBookingDate, type BookingConfirmation } from "@/lib/booking";
import { formatTime12h } from "@/lib/format";
import { SITE } from "@/lib/site";

type BookingEmail = BookingConfirmation & { notes: string };

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/**
 * Emails a new booking to SITE.bookingNotifyEmails through Gmail. Sends from BOOKING_EMAIL_USER
 * using a Gmail app password (BOOKING_EMAIL_APP_PASSWORD). Does nothing if those aren't set.
 * Never throws: the booking is already saved, so a failed email is only logged.
 */
export async function sendBookingEmail(booking: BookingEmail): Promise<void> {
  const user = process.env.BOOKING_EMAIL_USER;
  const pass = process.env.BOOKING_EMAIL_APP_PASSWORD;
  if (!user || !pass) {
    console.warn("[booking-email] BOOKING_EMAIL_USER / BOOKING_EMAIL_APP_PASSWORD not set; skipping email.");
    return;
  }

  const date = formatBookingDate(booking.date);
  const time = formatTime12h(booking.time);
  const waLink = `https://wa.me/${booking.phone.replace(/^\+/, "")}`;
  const rows: [string, string][] = [
    ["Name", booking.name],
    ["Phone", booking.phone],
    ["Service", booking.serviceName],
    ["Price", booking.priceLabel],
    ["Date", date],
    ["Time", time],
    ["Notes", booking.notes || "None"],
  ];

  const text = [
    `New booking request from the ${SITE.name} website.`,
    "",
    ...rows.map(([label, value]) => `${label}: ${value}`),
    "",
    `WhatsApp the client: ${waLink}`,
    "It is saved as a pending appointment. Please call or WhatsApp the client to confirm.",
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;font-size:15px;color:#1f0b1d">
      <h2 style="margin:0 0 12px">New booking request</h2>
      <table cellpadding="6" style="border-collapse:collapse">
        ${rows
          .map(
            ([label, value]) =>
              `<tr><td style="color:#6b5a68"><b>${label}</b></td><td>${escapeHtml(value).replace(/\n/g, "<br>")}</td></tr>`,
          )
          .join("")}
      </table>
      <p style="margin-top:16px">
        <a href="tel:${booking.phone}">Call ${escapeHtml(booking.phone)}</a> &nbsp;·&nbsp;
        <a href="${waLink}">WhatsApp the client</a>
      </p>
      <p style="color:#6b5a68">Saved as a pending appointment. Please contact the client to confirm.</p>
    </div>`;

  try {
    const transport = nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
    await transport.sendMail({
      from: `"${SITE.name} Website" <${user}>`,
      to: SITE.bookingNotifyEmails.join(", "),
      subject: `New booking: ${booking.serviceName} on ${date} at ${time}`,
      text,
      html,
    });
  } catch (err) {
    console.error("[booking-email] Send failed:", err instanceof Error ? err.message : err);
  }
}
