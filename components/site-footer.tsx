import { MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { GoogleReviewBadge } from "@/components/google-review-badge";
import { SocialLinks } from "@/components/social-links";
import { FULL_ADDRESS, NAV_LINKS, SITE, whatsappLink } from "@/lib/site";

export function SiteFooter() {
  const whatsapp = whatsappLink();

  return (
    <footer className="bg-plum-950 text-white/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-2">
          <p className="font-display text-3xl text-white">{SITE.name}</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">{SITE.tagline}</p>
          <div className="mt-6">
            <SocialLinks tone="light" />
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-[0.2em] text-gold-400 uppercase">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-semibold tracking-[0.2em] text-gold-400 uppercase">Visit Us</h2>
          <address className="mt-4 space-y-3 text-sm not-italic">
            <a
              href={SITE.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-2 transition-colors hover:text-white"
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-gold-400" />
              {FULL_ADDRESS}
            </a>
            {SITE.phone && (
              <a href={`tel:${SITE.phone}`} className="flex gap-2 transition-colors hover:text-white">
                <Phone className="mt-0.5 size-4 shrink-0 text-gold-400" />
                Call: {SITE.phoneDisplay}
              </a>
            )}
            {whatsapp && (
              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex gap-2 transition-colors hover:text-white"
              >
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-gold-400" />
                WhatsApp: {SITE.whatsappDisplay}
              </a>
            )}
          </address>
          <GoogleReviewBadge className="mt-6" />
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-xs text-white/45 sm:px-6 lg:px-8">
          &copy; {SITE.name}, {SITE.address.area}, {SITE.address.city}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
