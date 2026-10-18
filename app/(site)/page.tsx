import {
  ArrowRight,
  BadgePercent,
  CalendarHeart,
  Crown,
  Gem,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { CategoryCard } from "@/components/category-card";
import { GoogleReviewBadge } from "@/components/google-review-badge";
import { HeroSlider, type HeroSlide } from "@/components/hero-slider";
import { ServiceCard, ServiceCardSkeleton, ServicesError } from "@/components/service-card";
import { SocialLinks } from "@/components/social-links";
import { HERO_IMAGES } from "@/lib/images";
import { getActiveServices, pickFeatured } from "@/lib/services";
import { CATEGORY_ORDER, FULL_ADDRESS, SITE } from "@/lib/site";

const CATEGORY_BLURBS: Record<(typeof CATEGORY_ORDER)[number], string> = {
  "Bridal & Makeup": "Bridal, engagement, mehndi and party makeup with hair styling.",
  "Hair Treatments": "Keratin and smoothing treatments, cuts, colour and styling.",
  "Skincare & Facials": "HydraFacials, whitening and glow facials, threading and waxing.",
  Nails: "Manicures, spa pedicures, gel extensions and nail art.",
  "Spa & Body": "Relaxing body massages, polishes and scrubs.",
};

const PROMISES = [
  { Icon: Gem, title: "Premium Products", text: "Trusted professional brands for makeup, hair and skin." },
  { Icon: ShieldCheck, title: "Hygiene First", text: "Sanitised tools and fresh disposables for every client." },
  { Icon: HeartHandshake, title: "Personal Attention", text: "Experienced stylists who take time to understand your look." },
];

const PRIMARY_CTA =
  "inline-flex items-center gap-2 rounded-full bg-gold-400 px-7 py-3.5 font-semibold text-plum-950 shadow-lg shadow-gold-500/20 transition hover:bg-gold-300";
const SECONDARY_CTA =
  "inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-semibold transition hover:bg-white/10";
const EYEBROW =
  "inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-white/5 px-4 py-1.5 text-sm text-gold-300";
const SLIDE_HEADING = "mt-6 font-display text-4xl leading-[1.05] font-semibold sm:text-6xl lg:text-7xl";
const SLIDE_TEXT = "mt-6 max-w-xl text-lg leading-relaxed text-white/75 sm:text-xl";

const HERO_SLIDES: HeroSlide[] = [
  {
    image: HERO_IMAGES[0],
    content: (
      <>
        <a
          href={SITE.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${EYEBROW} transition hover:bg-white/10`}
        >
          <MapPin className="size-4" />
          {SITE.address.area}, {SITE.address.city}
        </a>
        <h1 className={SLIDE_HEADING}>
          Sana&apos;s <span className="text-gold-400 italic">Beauty</span> Saloon
        </h1>
        <p className={SLIDE_TEXT}>{SITE.tagline}</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/services" className={PRIMARY_CTA}>
            <Sparkles className="size-5" />
            Explore Services
          </Link>
          <Link href="/book" className={SECONDARY_CTA}>
            <CalendarHeart className="size-5" />
            Book Now
          </Link>
        </div>
      </>
    ),
  },
  {
    image: HERO_IMAGES[1],
    content: (
      <>
        <p className={EYEBROW}>
          <Crown className="size-4" />
          Bridal Season
        </p>
        <h2 className={SLIDE_HEADING}>
          Your <span className="text-gold-400 italic">wedding</span> look, perfected
        </h2>
        <p className={SLIDE_TEXT}>Barat, Mehndi &amp; Walima looks with complete pre-bridal grooming.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/deals" className={PRIMARY_CTA}>
            <BadgePercent className="size-5" />
            View Bridal Deals
          </Link>
          <Link href="/book" className={SECONDARY_CTA}>
            <CalendarHeart className="size-5" />
            Book a Trial
          </Link>
        </div>
      </>
    ),
  },
  {
    image: HERO_IMAGES[2],
    content: (
      <>
        <p className={EYEBROW}>
          <Sparkles className="size-4" />
          Hair &amp; Skin
        </p>
        <h2 className={SLIDE_HEADING}>
          Healthy hair, <span className="text-gold-400 italic">glowing</span> skin
        </h2>
        <p className={SLIDE_TEXT}>Keratin treatments, HydraFacials and expert care for everyday confidence.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/services" className={PRIMARY_CTA}>
            <Sparkles className="size-5" />
            See Prices
          </Link>
          <Link href="/book" className={SECONDARY_CTA}>
            <CalendarHeart className="size-5" />
            Book Now
          </Link>
        </div>
      </>
    ),
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  name: SITE.name,
  slogan: SITE.tagline,
  description: SITE.description,
  address: {
    "@type": "PostalAddress",
    streetAddress: `${SITE.address.unit}, ${SITE.address.line1}, ${SITE.address.block}, ${SITE.address.area}`,
    addressLocality: SITE.address.city,
    postalCode: SITE.address.postalCode,
    addressCountry: "PK",
  },
  ...(SITE.phone ? { telephone: SITE.phone } : {}),
  hasMap: SITE.mapsUrl,
  sameAs: Object.values(SITE.social).filter(Boolean),
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <HeroSlider slides={HERO_SLIDES} />

      {/* Category highlights */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {CATEGORY_ORDER.map((category) => (
            <li key={category}>
              <CategoryCard category={category} text={CATEGORY_BLURBS[category]} linkLabel="Explore" />
            </li>
          ))}
        </ul>
      </section>

      {/* Featured deals from Supabase */}
      <section className="bg-gradient-to-b from-cream to-rose-blush/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-gold-600 uppercase">Featured</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-plum-900 sm:text-4xl">
                Deals &amp; Bridal Packages
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-1.5 font-semibold text-plum-700 hover:text-plum-900"
            >
              View full menu
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-10">
            <Suspense fallback={<FeaturedFallback />}>
              <FeaturedServices />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] text-gold-600 uppercase">Why Sana&apos;s</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-plum-900 sm:text-4xl">
              Beauty care you can trust in Satellite Town
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink/70">
              Whether it&apos;s your wedding day or a well-deserved pampering session, our team gives every client
              personal attention, honest advice and results that last.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-1.5 font-semibold text-plum-700 hover:text-plum-900"
            >
              About us
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <ul className="grid gap-4">
            {PROMISES.map(({ Icon, title, text }) => (
              <li key={title} className="flex gap-4 rounded-2xl border border-plum-100 bg-white p-5">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gold-300/30 text-gold-600">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-semibold text-ink">{title}</h3>
                  <p className="mt-1 text-sm text-ink/65">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Reviews & socials */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-plum-100 sm:p-10">
            <h2 className="font-display text-2xl font-semibold text-plum-900">Loved your visit?</h2>
            <p className="mt-2 text-ink/65">
              Your Google review helps other brides and clients in Rawalpindi find us. It only takes a minute.
            </p>
            <GoogleReviewBadge className="mt-6" />
          </div>
          <div className="rounded-3xl bg-plum-900 p-8 text-white sm:p-10">
            <h2 className="font-display text-2xl font-semibold">Follow our latest looks</h2>
            <p className="mt-2 text-white/70">
              Bridal transformations, before &amp; afters and monthly deals on our socials.
            </p>
            <div className="mt-6">
              <SocialLinks tone="light" showLabels />
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-3xl border border-plum-100 bg-white p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-start gap-3">
            <MapPin className="mt-1 size-5 shrink-0 text-plum-700" aria-hidden="true" />
            <div>
              <p className="font-semibold text-ink">Visit us</p>
              <p className="text-ink/65">{FULL_ADDRESS}</p>
            </div>
          </div>
          <a
            href={SITE.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-plum-200 px-5 py-2.5 text-sm font-semibold text-plum-800 transition hover:bg-plum-50"
          >
            Get directions
            <ArrowRight className="size-4" />
          </a>
        </div>
      </section>
    </>
  );
}

async function FeaturedServices() {
  const result = await getActiveServices();
  if (!result.ok) return <ServicesError message={result.error} />;

  const featured = pickFeatured(result.services);
  if (featured.length === 0) {
    return <ServicesError message="Our new menu is coming soon." />;
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {featured.map((service) => (
        <li key={service.id}>
          <ServiceCard service={service} />
        </li>
      ))}
    </ul>
  );
}

function FeaturedFallback() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }, (_, i) => (
        <ServiceCardSkeleton key={i} />
      ))}
    </div>
  );
}
