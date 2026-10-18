import { ArrowUpRight, Star } from "lucide-react";
import { GoogleIcon } from "@/components/brand-icons";
import { SITE } from "@/lib/site";

export function GoogleReviewBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href={SITE.googleReviewUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-3 rounded-2xl border border-plum-100 bg-white px-4 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${className}`}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-plum-50">
        <GoogleIcon className="size-5" />
      </span>
      <span className="flex flex-col text-left">
        <span className="flex items-center gap-0.5 text-gold-500" aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <Star key={i} className="size-3.5 fill-current" />
          ))}
        </span>
        <span className="text-sm font-semibold text-ink">Review us on Google</span>
      </span>
      <ArrowUpRight className="size-4 text-plum-500 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}
