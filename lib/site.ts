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
  // TODO: add the salon's phone and WhatsApp numbers (international format, e.g. "+923001234567").
  phone: "",
  whatsapp: "",
  // TODO: replace with the salon's real profile URLs. Empty links render as "coming soon".
  social: {
    instagram: "",
    facebook: "",
    tiktok: "",
  },
} as const;

export const FULL_ADDRESS = `${SITE.address.line1}, ${SITE.address.area}, ${SITE.address.city}`;

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
