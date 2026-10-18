import type { CATEGORY_ORDER } from "@/lib/site";

// Photos live in public/images. Upload a file with exactly these names to show it on the site;
// until a file exists, its spot shows the plain design instead. See public/images/README.txt.

/** Home page hero slider, in order. Portrait 4:5, about 1000 x 1250 (shown in the arch on desktop). */
export const HERO_IMAGES = [
  "/images/hero/slide-1.jpg",
  "/images/hero/slide-2.jpg",
  "/images/hero/slide-3.jpg",
] as const;

/** Category cards on the Home and About pages. Landscape 4:3, about 1200 x 900. */
export const CATEGORY_IMAGES: Record<(typeof CATEGORY_ORDER)[number], string> = {
  "Bridal & Makeup": "/images/categories/bridal-makeup.jpg",
  "Hair Treatments": "/images/categories/hair-treatments.jpg",
  "Skincare & Facials": "/images/categories/skincare-facials.jpg",
  Nails: "/images/categories/nails.jpg",
  "Spa & Body": "/images/categories/spa-body.jpg",
};

/** About page, beside "Our story". Portrait 4:5, about 1000 x 1250. */
export const ABOUT_IMAGE = "/images/about/salon.jpg";
