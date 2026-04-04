"use client";

import Image from "next/image";
import { urlFor } from "@/lib/sanity.client";
import { useState } from "react";

interface SanityImageProps {
  image: any;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  aspectRatio?: "video" | "square" | "portrait" | "wide";
}

export default function SanityImage({
  image,
  alt,
  className = "",
  width,
  height,
  fill = false,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  aspectRatio,
}: SanityImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (!image) {
    return (
      <div className={`bg-zinc-100 animate-pulse ${className}`} style={{ aspectRatio: aspectRatio === 'video' ? '16/9' : aspectRatio === 'square' ? '1/1' : undefined }} />
    );
  }

  // Check if image is a string (direct URL) or a Sanity image object
  const isDirectUrl = typeof image === 'string';
  let finalUrl = "";

  if (isDirectUrl) {
    finalUrl = image;
  } else {
    // Generate the URL with optimizations for Sanity images
    let imageUrlBuilder = urlFor(image).auto('format').quality(80);
    if (width) imageUrlBuilder = imageUrlBuilder.width(width);
    if (height) imageUrlBuilder = imageUrlBuilder.height(height);
    finalUrl = imageUrlBuilder.url();
  }

  const aspectStyles = {
    video: "aspect-video",
    square: "aspect-square",
    portrait: "aspect-[3/4]",
    wide: "aspect-[21/9]",
  };

  return (
    <div className={`relative overflow-hidden ${aspectRatio ? aspectStyles[aspectRatio] : ""} ${className}`}>
      <Image
        src={finalUrl}
        alt={alt}
        width={!fill ? width || 800 : undefined}
        height={!fill ? height || 450 : undefined}
        fill={fill}
        priority={priority}
        sizes={sizes}
        className={`
          duration-700 ease-in-out object-cover
          ${isLoading ? "scale-110 blur-2xl grayscale" : "scale-100 blur-0 grayscale-0"}
        `}
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
