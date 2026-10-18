import type { Metadata } from "next";
import { ArrowRight, BadgePercent, CalendarHeart } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ContactButtons } from "@/components/contact-buttons";
import { ServiceCard, ServiceCardSkeleton, ServicesError } from "@/components/service-card";
import { getActiveServices, splitDeals } from "@/lib/services";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Deals",
  description: `Current deals and discounted packages at ${SITE.name}, Satellite Town, Rawalpindi. View prices and book online.`,
};

export default function DealsPage() {
  return (
    <>
      <section className="border-b border-plum-100 bg-gradient-to-b from-rose-blush/60 to-cream">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.3em] text-gold-600 uppercase">Special Offers</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold text-plum-900 sm:text-5xl">Deals</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink/70">
            Save on combined treatments and grooming packages at {SITE.name}. Deals change from time to time, so book
            yours while it lasts.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <Suspense fallback={<DealsFallback />}>
          <DealsList />
        </Suspense>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-plum-900 p-8 text-white sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Looking for a single treatment?</h2>
            <p className="mt-2 text-white/70">Browse our full menu of bridal, hair and skincare services.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 font-semibold text-plum-950 transition hover:bg-gold-300"
            >
              View Services
              <ArrowRight className="size-5" aria-hidden="true" />
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 font-semibold transition hover:bg-white/10"
            >
              <CalendarHeart className="size-5" aria-hidden="true" />
              Book Now
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

async function DealsList() {
  const result = await getActiveServices();
  if (!result.ok) return <ServicesError message={result.error} />;

  const { deals } = splitDeals(result.services);
  if (deals.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-plum-200 bg-white p-8 text-center sm:p-10">
        <BadgePercent className="mx-auto size-10 text-gold-500" aria-hidden="true" />
        <p className="mt-4 font-display text-2xl text-plum-900">New deals coming soon</p>
        <p className="mx-auto mt-2 max-w-md text-ink/65">
          There are no deals running right now. Message us to ask about upcoming offers.
        </p>
        <div className="mt-6 flex justify-center">
          <ContactButtons message={`Hi ${SITE.name}, do you have any deals running at the moment?`} />
        </div>
      </div>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {deals.map((service) => (
        <li key={service.id}>
          <ServiceCard service={service} />
        </li>
      ))}
    </ul>
  );
}

function DealsFallback() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
  );
}
