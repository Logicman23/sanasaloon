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

/**
 * About page "Visit our salon" gallery, in display order. The first photo is shown largest.
 * Keep 1 + a multiple of 4 photos (5, 9, 13) so the grid has no gaps.
 */
export const SALON_GALLERY = [
  { src: "/images/salon/interior-09.jpg", alt: "Main salon floor with styling stations and pedicure lounge" },
  { src: "/images/salon/interior-01.jpg", alt: "Reception desk at the salon entrance" },
  { src: "/images/salon/interior-02.jpg", alt: "Hair styling stations with mirrors" },
  { src: "/images/salon/interior-04.jpg", alt: "Pedicure lounge with velvet chairs" },
  { src: "/images/salon/interior-05.jpg", alt: "Facial and skin treatment room" },
  { src: "/images/salon/interior-06.jpg", alt: "Hair wash area and product shelves" },
  { src: "/images/salon/interior-03.jpg", alt: "Styling chairs in front of a large mirror" },
  { src: "/images/salon/interior-14.jpg", alt: "View across the salon towards the styling area" },
  { src: "/images/salon/interior-10.jpg", alt: "Pedicure chairs beside the product shelves" },
] as const;
