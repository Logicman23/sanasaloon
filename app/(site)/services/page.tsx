import type { Metadata } from "next";
import { BadgePercent, CalendarHeart, MessageCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ServiceCardSkeleton, ServicesError } from "@/components/service-card";
import { ServicesBrowser } from "@/components/services-browser";
import { getActiveServices, getCategories, splitDeals } from "@/lib/services";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Bridal makeup and grooming packages, keratin and hair treatments, HydraFacials and skincare at Sana's Beauty Saloon, Satellite Town, Rawalpindi. View prices and book online.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="border-b border-plum-100 bg-gradient-to-b from-rose-blush/60 to-cream">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.3em] text-gold-600 uppercase">Menu &amp; Pricing</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold text-plum-900 sm:text-5xl">
            Our Services
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink/70">
            From complete bridal grooming to advanced facials and hair treatments, explore everything we offer at{" "}
            {SITE.name}. Prices may vary with hair length, skin needs and products chosen.
          </p>
          <Link
            href="/deals"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold-400 bg-white px-5 py-2.5 text-sm font-semibold text-plum-800 transition hover:bg-gold-300/30"
          >
            <BadgePercent className="size-4 text-gold-600" aria-hidden="true" />
            See our current deals
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense fallback={<ServicesGridFallback />}>
          <ServicesList />
        </Suspense>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-plum-900 p-8 text-white sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Not sure which package suits you?</h2>
            <p className="mt-2 text-white/70">
              Book a consultation and our team will tailor a look and treatment plan for you.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 font-semibold text-plum-950 transition hover:bg-gold-300"
            >
              <CalendarHeart className="size-5" />
              Book Now
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 font-semibold transition hover:bg-white/10"
            >
              <MessageCircle className="size-5" />
              Ask Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

async function ServicesList() {
  const result = await getActiveServices();
  if (!result.ok) return <ServicesError message={result.error} />;

  const { regular } = splitDeals(result.services);
  return <ServicesBrowser services={regular} categories={getCategories(regular)} />;
}

function ServicesGridFallback() {
  return (
    <div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-11 w-36 animate-pulse rounded-full bg-plum-50" />
        ))}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <ServiceCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
