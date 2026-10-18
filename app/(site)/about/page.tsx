import type { Metadata } from "next";
import { ArrowRight, CalendarHeart, Gem, HeartHandshake, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { GoogleReviewBadge } from "@/components/google-review-badge";
import { CATEGORY_ORDER, FULL_ADDRESS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description: `About ${SITE.name}: professional bridal grooming, hair treatments and advanced skincare in Satellite Town, Rawalpindi.`,
};

// TODO: replace with the salon's real story (founding year, Sana's background, team size, signature work).
const STORY = [
  `${SITE.name} is a neighbourhood beauty salon at ${SITE.address.line1} in ${SITE.address.area}, Rawalpindi, dedicated to helping every client look and feel their best.`,
  "From complete bridal makeovers to everyday hair and skin care, our team combines professional techniques with genuine personal attention, so you leave confident in the results and comfortable with the experience.",
];

const VALUES = [
  {
    Icon: HeartHandshake,
    title: "Personal attention",
    text: "We listen first. Every look and treatment is planned around your features, skin, hair and occasion.",
  },
  {
    Icon: Gem,
    title: "Quality products",
    text: "We use professional-grade makeup, hair and skincare products chosen for lasting, natural-looking results.",
  },
  {
    Icon: ShieldCheck,
    title: "Hygiene & care",
    text: "Clean tools, fresh disposables and a tidy, comfortable space for every appointment.",
  },
  {
    Icon: Sparkles,
    title: "Honest advice",
    text: "Clear pricing and straightforward recommendations, never pressure to book more than you need.",
  },
];

const EXPERTISE: Record<(typeof CATEGORY_ORDER)[number], string> = {
  "Bridal & Packages":
    "Barat, mehndi and walima looks with hairstyling, dupatta setting and pre-bridal grooming packages.",
  "Hair Treatments": "Keratin and smoothing treatments, cuts, colour and styling for healthy, manageable hair.",
  "Skincare & Facials": "Advanced facials including the 7-step HydraFacial for deep cleansing and lasting glow.",
};

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-plum-100 bg-gradient-to-b from-rose-blush/60 to-cream">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <p className="text-xs font-semibold tracking-[0.3em] text-gold-600 uppercase">About Us</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold text-plum-900 sm:text-5xl">
            Beauty care with a personal touch
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink/70">{SITE.tagline}</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:px-8">
        <div className="space-y-5 text-lg leading-relaxed text-ink/75">
          <h2 className="font-display text-3xl font-semibold text-plum-900">Our story</h2>
          {STORY.map((p) => (
            <p key={p.slice(0, 24)}>{p}</p>
          ))}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 rounded-full bg-plum-800 px-6 py-3 text-base font-semibold text-white transition hover:bg-plum-900"
            >
              <CalendarHeart className="size-5" aria-hidden="true" />
              Book an appointment
            </Link>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full border border-plum-200 px-6 py-3 text-base font-semibold text-plum-800 transition hover:bg-plum-50"
            >
              View services
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm">
          <div className="aspect-[4/5] rounded-[10rem_10rem_2rem_2rem] bg-gradient-to-b from-plum-800 to-plum-950 p-10 text-white">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-display text-5xl font-semibold">{SITE.shortName}</p>
              <p className="mt-2 text-xs tracking-[0.35em] text-gold-400 uppercase">Beauty Saloon</p>
              <div className="my-8 h-px w-16 bg-gold-400/50" />
              <p className="flex items-center gap-2 text-sm text-white/75">
                <MapPin className="size-4 text-gold-400" aria-hidden="true" />
                {SITE.address.area}, {SITE.address.city}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-3xl font-semibold text-plum-900">What we stand for</h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ Icon, title, text }) => (
              <li key={title} className="rounded-3xl border border-plum-100 bg-cream p-6">
                <span className="flex size-11 items-center justify-center rounded-xl bg-gold-300/30 text-gold-600">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-semibold text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-semibold text-plum-900">Our expertise</h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {CATEGORY_ORDER.map((category) => (
            <li key={category}>
              <Link
                href={`/services?category=${encodeURIComponent(category)}`}
                className="group flex h-full flex-col rounded-3xl border border-plum-100 bg-white p-7 transition hover:border-plum-300 hover:shadow-md"
              >
                <CategoryIcon category={category} className="size-7 text-plum-700" />
                <h3 className="mt-4 font-display text-xl font-semibold text-ink">{category}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/65">{EXPERTISE[category]}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-plum-700">
                  See prices
                  <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-plum-900 p-8 text-white sm:p-10 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">Come visit us</h2>
            <p className="mt-2 text-white/70">{FULL_ADDRESS}</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <GoogleReviewBadge />
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3 font-semibold text-plum-950 transition hover:bg-gold-300"
            >
              Contact &amp; directions
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
