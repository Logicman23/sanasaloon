"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Photo } from "@/components/photo";

export type HeroSlide = {
  image: string;
  content: ReactNode;
};

const INTERVAL_MS = 7000;

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (paused || count < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setActive((i) => (i + 1) % count), INTERVAL_MS);
    return () => clearInterval(id);
  }, [paused, count, active]);

  const go = (i: number) => setActive((i + count) % count);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Highlights"
      className="relative overflow-hidden bg-plum-950 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(216,181,111,0.25),transparent_55%),radial-gradient(ellipse_at_bottom_left,rgba(142,74,120,0.45),transparent_60%)]"
      />

      {/* Slides share one grid cell, so the hero is as tall as the tallest slide. */}
      <div className="grid">
        {slides.map((slide, i) => (
          <div
            key={slide.image}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            aria-hidden={i !== active}
            inert={i !== active}
            className={`relative col-start-1 row-start-1 transition-opacity duration-1000 ${
              i === active ? "z-10 opacity-100" : "opacity-0"
            }`}
          >
            {/* Portrait photos: full background behind the text on small screens, an arch on the right from lg. */}
            <div className="mx-auto grid min-h-[34rem] max-w-7xl items-center gap-12 px-4 py-20 sm:min-h-[38rem] sm:px-6 sm:py-28 lg:grid-cols-[1.3fr_1fr] lg:px-8">
              <div className="relative z-10 max-w-2xl">{slide.content}</div>
              <div className="absolute inset-0 lg:relative lg:inset-auto lg:mx-auto lg:aspect-[4/5] lg:w-full lg:max-w-sm lg:overflow-hidden lg:rounded-[10rem_10rem_2rem_2rem] lg:border lg:border-gold-400/30 lg:bg-gradient-to-b lg:from-plum-700/60 lg:to-plum-900/40">
                <Photo
                  src={slide.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 384px, 100vw"
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  className="object-cover object-[50%_20%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-r from-plum-950/90 via-plum-950/75 to-plum-950/45 lg:hidden"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-6 z-20 mx-auto flex max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => go(active - 1)}
            aria-label="Previous slide"
            className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-plum-950/40 transition hover:bg-white/15"
          >
            <ChevronLeft className="size-5" aria-hidden="true" />
          </button>
          <div className="flex gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.image}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === active}
                className="flex h-10 items-center"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all ${
                    i === active ? "w-8 bg-gold-400" : "w-4 bg-white/40 hover:bg-white/70"
                  }`}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(active + 1)}
            aria-label="Next slide"
            className="flex size-10 items-center justify-center rounded-full border border-white/30 bg-plum-950/40 transition hover:bg-white/15"
          >
            <ChevronRight className="size-5" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
