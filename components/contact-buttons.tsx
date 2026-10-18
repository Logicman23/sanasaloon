import { MessageCircle, Phone } from "lucide-react";
import { SITE, whatsappLink } from "@/lib/site";

/** Call + WhatsApp buttons. Each one shows as "coming soon" until its number is set in lib/site.ts. */
export function ContactButtons({ message }: { message?: string }) {
  const whatsapp = whatsappLink(message ?? `Hi ${SITE.name}, I'd like to ask about an appointment.`);
  const base = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold transition";

  return (
    <div className="flex flex-wrap gap-3">
      {SITE.phone ? (
        <a href={`tel:${SITE.phone}`} className={`${base} bg-plum-800 text-white hover:bg-plum-900`}>
          <Phone className="size-5" aria-hidden="true" />
          Call {SITE.phoneDisplay}
        </a>
      ) : (
        <span className={`${base} cursor-not-allowed bg-plum-100 text-plum-800/60`} title="Phone number coming soon">
          <Phone className="size-5" aria-hidden="true" />
          Call (coming soon)
        </span>
      )}
      {whatsapp ? (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} bg-[#25D366] text-white hover:brightness-95`}
        >
          <MessageCircle className="size-5" aria-hidden="true" />
          WhatsApp Us
        </a>
      ) : (
        <span className={`${base} cursor-not-allowed bg-plum-100 text-plum-800/60`} title="WhatsApp number coming soon">
          <MessageCircle className="size-5" aria-hidden="true" />
          WhatsApp (coming soon)
        </span>
      )}
    </div>
  );
}
