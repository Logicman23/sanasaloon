import { ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { displayPrice, formatDuration } from "@/lib/format";
import { CATEGORY_ORDER, isDeal } from "@/lib/site";
import type { Service } from "@/lib/types";

export function ServiceCard({ service }: { service: Service }) {
  const duration = formatDuration(service.duration_minutes);
  const isBridal = service.category === CATEGORY_ORDER[0] || isDeal(service);

  return (
    <article
      className={`group relative flex h-full flex-col rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
        isBridal ? "border-gold-300" : "border-plum-100"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-plum-50 px-3 py-1 text-xs font-medium text-plum-700">
          <CategoryIcon category={service.category} className="size-3.5" />
          {service.category}
        </span>
        {duration && (
          <span className="inline-flex shrink-0 items-center gap-1 text-xs text-ink/55">
            <Clock className="size-3.5" aria-hidden="true" />
            {duration}
          </span>
        )}
      </div>

      <h3 className="mt-5 font-display text-xl leading-snug font-semibold text-ink">{service.name}</h3>
      {service.description && (
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/65">{service.description}</p>
      )}

      {/* Wraps so long prices ("Rs. 15,000 – 25,000") stay on one line and push Book below on narrow cards. */}
      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-3 pt-6">
        <div>
          <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-ink/45 uppercase">Price</p>
          <p className="font-display text-2xl font-semibold whitespace-nowrap text-plum-800">{displayPrice(service)}</p>
        </div>
        <Link
          href={`/book?service=${encodeURIComponent(service.id)}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-plum-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-plum-900"
          aria-label={`Book ${service.name}`}
        >
          Book
          <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}

export function ServiceCardSkeleton() {
  return (
    <div className="h-64 animate-pulse rounded-3xl border border-plum-100 bg-white p-6" aria-hidden="true">
      <div className="h-6 w-32 rounded-full bg-plum-50" />
      <div className="mt-6 h-6 w-3/4 rounded bg-plum-50" />
      <div className="mt-3 h-4 w-full rounded bg-plum-50" />
      <div className="mt-2 h-4 w-2/3 rounded bg-plum-50" />
      <div className="mt-10 h-8 w-28 rounded bg-plum-50" />
    </div>
  );
}

export function ServicesError({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-3xl border border-plum-200 bg-white p-8 text-center">
      <p className="font-display text-xl text-plum-800">{message}</p>
      <p className="mt-2 text-sm text-ink/60">
        Please try again shortly, or call us and we&apos;ll share our latest menu and deals.
      </p>
    </div>
  );
}
