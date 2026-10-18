import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CategoryIcon } from "@/components/category-icon";
import { Photo } from "@/components/photo";
import { CATEGORY_IMAGES } from "@/lib/images";
import type { CATEGORY_ORDER } from "@/lib/site";

/** Category tile linking to its section of the Services page, with the category photo on top. */
export function CategoryCard({
  category,
  text,
  linkLabel,
  as: Heading = "h2",
}: {
  category: (typeof CATEGORY_ORDER)[number];
  text: string;
  linkLabel: string;
  as?: "h2" | "h3";
}) {
  return (
    <Link
      href={`/services?category=${encodeURIComponent(category)}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-plum-100 bg-white transition hover:border-plum-300 hover:shadow-md"
    >
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-plum-50 to-rose-blush">
        <CategoryIcon category={category} className="size-10 text-plum-300" />
        <Photo
          src={CATEGORY_IMAGES[category]}
          alt=""
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover object-[50%_25%] transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <Heading className="font-display text-xl font-semibold text-ink">{category}</Heading>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink/65">{text}</p>
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-plum-700">
          {linkLabel}
          <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
