"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * A photo that fades in once it has loaded. If the file hasn't been uploaded yet it stays
 * invisible, so whatever is behind it (a gradient or icon) shows instead of a broken image.
 */
export function Photo({ className = "", alt, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  return (
    <Image
      {...props}
      alt={alt}
      className={`${className} transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
      // next/image also calls onLoad for a missing file that is already "complete", so check it has pixels.
      onLoad={(e) => setLoaded(e.currentTarget.naturalWidth > 0)}
    />
  );
}
