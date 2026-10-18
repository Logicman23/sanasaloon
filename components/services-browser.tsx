"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { CategoryIcon } from "@/components/category-icon";
import { ServiceCard } from "@/components/service-card";
import type { Service } from "@/lib/types";

const ALL = "All";

type Props = { services: Service[]; categories: string[] };

export function ServicesBrowser({ services, categories }: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const requested = searchParams.get("category");
  const [active, setActive] = useState(requested && categories.includes(requested) ? requested : ALL);

  const select = (category: string) => {
    setActive(category);
    // Keep the URL shareable (/services?category=...) without a server round-trip.
    const params = new URLSearchParams(searchParams.toString());
    if (category === ALL) params.delete("category");
    else params.set("category", category);
    const query = params.toString();
    window.history.replaceState(null, "", query ? `${pathname}?${query}` : pathname);
  };

  const visible = active === ALL ? services : services.filter((s) => s.category === active);
  const countFor = (category: string) =>
    category === ALL ? services.length : services.filter((s) => s.category === category).length;

  return (
    <div>
      <div role="tablist" aria-label="Filter services by category" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
        {[ALL, ...categories].map((category) => {
          const selected = category === active;
          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="services-grid"
              onClick={() => select(category)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors ${
                selected
                  ? "border-plum-800 bg-plum-800 text-white"
                  : "border-plum-200 bg-white text-ink/75 hover:border-plum-300 hover:text-plum-800"
              }`}
            >
              {category !== ALL && <CategoryIcon category={category} className="size-4" />}
              {category}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${selected ? "bg-white/15" : "bg-plum-50 text-plum-700"}`}
              >
                {countFor(category)}
              </span>
            </button>
          );
        })}
      </div>

      <div id="services-grid" role="tabpanel" className="mt-8">
        {visible.length > 0 ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((service) => (
              <li key={service.id}>
                <ServiceCard service={service} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-3xl border border-dashed border-plum-200 bg-white p-10 text-center text-ink/60">
            No services in this category yet. Please check back soon.
          </p>
        )}
      </div>
    </div>
  );
}
