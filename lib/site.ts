// Central business details. Update contact numbers and social links here and
// every page (header, footer, home, contact) picks them up.

export const SITE = {
  name: "Sana's Beauty Saloon",
  shortName: "Sana's",
  tagline: "Professional Beauty Care, Bridal Grooming & Advanced Skincare",
  description:
    "Sana's Beauty Saloon in Satellite Town, Rawalpindi offers bridal makeup and grooming packages, hair treatments, and advanced skincare including HydraFacials.",
  address: {
    line1: "Nadeem Center",
    area: "Satellite Town",
    city: "Rawalpindi",
    country: "Pakistan",
  },
  googleReviewUrl: "https://g.page/r/CdaD2CwLw3ziEBM/review",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Nadeem+Center+Satellite+Town+Rawalpindi",
  // TODO: add the salon's phone number (international format, e.g. "+923001234567").
  phone: "",
  whatsapp: "+923211467008",
  // Local format shown on the page.
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

export const FULL_ADDRESS = `${SITE.address.line1}, ${SITE.address.area}, ${SITE.address.city}`;

/** wa.me link for the salon's WhatsApp, or null when no number is configured. */
export function whatsappLink(message?: string): string | null {
  const digits = SITE.whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services & Deals" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/book", label: "Book Appointment" },
] as const;

// Display order for known categories. Unknown categories from the database are appended after these.
export const CATEGORY_ORDER = [
  "Bridal & Packages",
  "Hair Treatments",
  "Skincare & Facials",
] as const;
