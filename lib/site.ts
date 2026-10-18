// Central business details. Update contact numbers and social links here and
// every page (header, footer, home, contact) picks them up.

export const SITE = {
  name: "Sana's Beauty Saloon",
  shortName: "Sana's",
  tagline: "Professional Beauty Care, Bridal Grooming & Advanced Skincare",
  description:
    "Sana's Beauty Saloon in Satellite Town, Rawalpindi offers bridal makeup and grooming packages, hair treatments, and advanced skincare including HydraFacials.",
  address: {
    unit: "Ground Floor",
    line1: "Nadeem Center",
    block: "B-Block",
    area: "Satellite Town",
    city: "Rawalpindi",
    postalCode: "46000",
    country: "Pakistan",
  },
  googleReviewUrl: "https://g.page/r/CdaD2CwLw3ziEBM/review",
  // Google Maps listing ID (cid) of the salon's Business Profile, resolved from googleReviewUrl.
  mapsCid: "16320133602448278486",
  mapsUrl: "https://maps.google.com/?cid=16320133602448278486",
  // International format for tel:/wa.me links; the *Display values are what the page shows.
  phone: "+923211467008",
  phoneDisplay: "0321 1467008",
  whatsapp: "+923211467008",
  whatsappDisplay: "0321 1467008",
  timeZone: "Asia/Karachi",
  // TODO: confirm real opening hours. Times are 24h "HH:MM"; booking slots run from open until 30 min before close.
  hours: { open: "11:00", close: "20:00", label: "Open daily, 11:00 AM – 8:00 PM" },
  // TODO: replace with the salon's real profile URLs. Empty links render as "coming soon".
  social: {
    instagram: "",
    facebook: "",
    tiktok: "",
  },
} as const;

const { unit, line1, block, area, city, postalCode, country } = SITE.address;
export const FULL_ADDRESS = `${unit}, ${line1}, ${block}, ${area}, ${city} ${postalCode}, ${country}`;

/** wa.me link for the salon's WhatsApp, or null when no number is configured. */
export function whatsappLink(message?: string): string | null {
  const digits = SITE.whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/deals", label: "Deals" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/book", label: "Book Appointment" },
] as const;

// Items whose category is exactly this are listed on the Deals page instead of Services.
export const DEALS_CATEGORY = "Deals";

export const isDeal = (service: { category: string }) => service.category === DEALS_CATEGORY;

// Display order for known service categories. Unknown categories from the database are appended after these.
// Names match the POS categories as mapped in lib/services.ts.
export const CATEGORY_ORDER = [
  "Bridal & Makeup",
  "Hair Treatments",
  "Skincare & Facials",
  "Nails",
  "Spa & Body",
] as const;
