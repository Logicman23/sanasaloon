"use client";

import { CalendarHeart, LockKeyhole, Menu, MessageCircle, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV_LINKS, SITE, whatsappLink } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const whatsapp = whatsappLink();

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  // "Book Appointment" is shown as the CTA button, so keep it out of the plain link list on desktop.
  const links = NAV_LINKS.filter((l) => l.href !== "/book");

  return (
    <header className="sticky top-0 z-40 border-b border-plum-100/70 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex flex-col leading-none" aria-label={`${SITE.name} home`}>
          <span className="font-display text-2xl font-semibold text-plum-800">{SITE.shortName}</span>
          <span className="text-[0.65rem] font-medium tracking-[0.3em] text-gold-600 uppercase">
            Beauty Saloon
          </span>
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-plum-100 text-plum-800"
                      : "text-ink/75 hover:bg-plum-50 hover:text-plum-800"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp ${SITE.whatsappDisplay}`}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-plum-800 transition-colors hover:bg-plum-50"
            >
              <MessageCircle className="size-4" />
              <span className="hidden xl:inline">{SITE.whatsappDisplay}</span>
            </a>
          )}
          <Link
            href="/pos"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink/60 transition-colors hover:text-plum-800"
          >
            <LockKeyhole className="size-4" />
            POS Login
          </Link>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 rounded-full bg-plum-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-plum-900"
          >
            <CalendarHeart className="size-4" />
            Book Appointment
          </Link>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`WhatsApp ${SITE.whatsappDisplay}`}
              className="inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-plum-800 hover:bg-plum-50"
            >
              <MessageCircle className="size-5" />
              <span className="hidden sm:inline">{SITE.whatsappDisplay}</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-11 items-center justify-center rounded-full text-plum-800 hover:bg-plum-50"
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-plum-100 bg-cream lg:hidden">
          <ul className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4 sm:px-6">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`block rounded-xl px-4 py-3 font-medium ${
                    isActive(link.href) ? "bg-plum-100 text-plum-800" : "text-ink/80 hover:bg-plum-50"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {whatsapp && (
              <li className="mt-2 border-t border-plum-100 pt-3">
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 font-medium text-plum-800 hover:bg-plum-50"
                >
                  <MessageCircle className="size-5" />
                  WhatsApp {SITE.whatsappDisplay}
                </a>
              </li>
            )}
            <li className={whatsapp ? "" : "mt-2 border-t border-plum-100 pt-3"}>
              <Link href="/pos" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-ink/60 hover:bg-plum-50">
                <LockKeyhole className="size-4" />
                Staff POS Login
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
