import type { Metadata } from "next";
import { ArrowUpRight, CalendarHeart, Clock, MapPin, Navigation } from "lucide-react";
import Link from "next/link";
import { ContactButtons } from "@/components/contact-buttons";
import { GoogleReviewBadge } from "@/components/google-review-badge";
import { SocialLinks } from "@/components/social-links";
import { FULL_ADDRESS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact & Location",
  description: `Visit ${SITE.name} at ${FULL_ADDRESS}. Call, WhatsApp or get directions.`,
};

const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(
  `${SITE.address.line1}, ${SITE.address.area}, ${SITE.address.city}, ${SITE.address.country}`,
)}&z=16&output=embed`;

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-plum-100 bg-gradient-to-b from-rose-blush/60 to-cream">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.3em] text-gold-600 uppercase">Get in Touch</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-plum-900 sm:text-5xl">Contact &amp; Location</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink/70">
            We&apos;re in the heart of Satellite Town. Drop in, call, or send us a WhatsApp message.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8 lg:py-16">
        <div className="space-y-6">
          <div className="rounded-3xl border border-plum-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-plum-50 text-plum-700">
                <MapPin className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-semibold text-ink">{SITE.name}</h2>
                <address className="mt-2 leading-relaxed text-ink/70 not-italic">
                  {SITE.address.unit}, {SITE.address.line1}
                  <br />
                  {SITE.address.block}, {SITE.address.area}
                  <br />
                  {SITE.address.city} {SITE.address.postalCode}, {SITE.address.country}
                </address>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-plum-800 px-5 py-3 font-semibold text-white transition hover:bg-plum-900"
              >
                <Navigation className="size-5" aria-hidden="true" />
                Get Directions
              </a>
              <Link
                href="/book"
                className="inline-flex items-center gap-2 rounded-full border border-plum-200 px-5 py-3 font-semibold text-plum-800 transition hover:bg-plum-50"
              >
                <CalendarHeart className="size-5" aria-hidden="true" />
                Book Appointment
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-plum-100 bg-white p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-ink">Call or WhatsApp</h2>
            <p className="mt-1 mb-5 text-sm text-ink/65">Quickest way to check availability or ask about bridal packages.</p>
            <ContactButtons />
          </div>

          <div className="flex gap-4 rounded-3xl border border-plum-100 bg-white p-6 sm:p-8">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gold-300/30 text-gold-600">
              <Clock className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold text-ink">Opening Hours</h2>
              <p className="mt-1 text-ink/70">{SITE.hours.label}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="relative min-h-80 flex-1 overflow-hidden rounded-3xl border border-plum-100 bg-plum-50 shadow-sm">
            <iframe
              src={MAP_EMBED_URL}
              title={`Map showing ${SITE.name} at ${FULL_ADDRESS}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="absolute inset-0 size-full border-0"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-3xl border border-plum-100 bg-white p-6">
              <h2 className="font-semibold text-ink">Find us on Google</h2>
              <p className="mt-1 mb-4 text-sm text-ink/65">See reviews from our clients, or leave your own.</p>
              <GoogleReviewBadge />
              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-plum-700 hover:text-plum-900"
              >
                Open in Google Maps
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
            </div>
            <div className="rounded-3xl bg-plum-900 p-6 text-white">
              <h2 className="font-semibold">Follow us</h2>
              <p className="mt-1 mb-4 text-sm text-white/70">Latest looks, deals and bridal transformations.</p>
              <SocialLinks tone="light" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
