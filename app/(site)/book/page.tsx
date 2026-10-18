import type { Metadata } from "next";
import { connection } from "next/server";
import { Clock, MapPin, ShieldCheck } from "lucide-react";
import { Suspense, type ReactNode } from "react";
import { BookingForm } from "@/components/booking-form";
import { ContactButtons } from "@/components/contact-buttons";
import { ServicesError } from "@/components/service-card";
import { salonNow } from "@/lib/booking";
import { getActiveServices, getCategories } from "@/lib/services";
import { FULL_ADDRESS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book an Appointment",
  description: `Book bridal makeup, hair treatments or facials online at ${SITE.name}, Satellite Town, Rawalpindi.`,
};

export default function BookPage({ searchParams }: PageProps<"/book">) {
  return (
    <>
      <section className="border-b border-plum-100 bg-gradient-to-b from-rose-blush/60 to-cream">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.3em] text-gold-600 uppercase">Online Booking</p>
          <h1 className="mt-3 font-display text-4xl font-semibold text-plum-900 sm:text-5xl">Book an Appointment</h1>
          <p className="mt-4 max-w-2xl text-lg text-ink/70">
            Choose your service and a time that suits you. We&apos;ll confirm by phone or WhatsApp.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_22rem] lg:px-8 lg:py-16">
        <div className="rounded-3xl border border-plum-100 bg-white p-6 shadow-sm sm:p-10">
          <Suspense fallback={<FormSkeleton />}>
            <BookingSection searchParams={searchParams} />
          </Suspense>
        </div>

        <aside className="space-y-5">
          <InfoCard Icon={Clock} title="Opening hours">
            {SITE.hours.label}
          </InfoCard>
          <InfoCard Icon={MapPin} title="Location">
            <a href={SITE.mapsUrl} target="_blank" rel="noopener noreferrer" className="hover:text-plum-800 hover:underline">
              {FULL_ADDRESS}
            </a>
          </InfoCard>
          <InfoCard Icon={ShieldCheck} title="Bridal bookings">
            Getting married? Add your event dates in the notes and we&apos;ll plan trials and pre-bridal sessions around
            them.
          </InfoCard>
          <div className="rounded-3xl bg-plum-900 p-6 text-white">
            <p className="font-display text-xl">Prefer to talk?</p>
            <p className="mt-1 mb-5 text-sm text-white/70">Call or message us and we&apos;ll book for you.</p>
            <ContactButtons />
          </div>
        </aside>
      </section>
    </>
  );
}

async function BookingSection({ searchParams }: Pick<PageProps<"/book">, "searchParams">) {
  const [{ service }, result] = await Promise.all([searchParams, getActiveServices()]);
  // The available dates and slots depend on the current time, so this must render per request.
  await connection();
  if (!result.ok) return <ServicesError message={result.error} />;

  const requested = typeof service === "string" ? service : undefined;
  const initialServiceId = result.services.some((s) => s.id === requested) ? requested : undefined;

  return (
    <BookingForm
      services={result.services}
      categories={getCategories(result.services)}
      initialServiceId={initialServiceId}
      now={salonNow()}
    />
  );
}

function InfoCard({
  Icon,
  title,
  children,
}: {
  Icon: typeof Clock;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-3xl border border-plum-100 bg-white p-5">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-plum-50 text-plum-700">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <h2 className="font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-ink/65">{children}</p>
      </div>
    </div>
  );
}

function FormSkeleton() {
  return (
    <div className="animate-pulse space-y-6" aria-hidden="true">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i}>
          <div className="mb-2 h-4 w-24 rounded bg-plum-50" />
          <div className="h-12 rounded-xl bg-plum-50" />
        </div>
      ))}
      <div className="h-12 w-52 rounded-full bg-plum-50" />
    </div>
  );
}
