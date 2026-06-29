"use client";

import Image from "next/image";
import { useState } from "react";

interface AvatarProps {
  src?: string;
  alt: string;
  size: number;
  className?: string;
  initials?: string;
  gradient?: string;
  fallbackClassName?: string;
  fallbackSrc?: string;
}

export default function Avatar({
  src,
  alt,
  size,
  className,
  initials,
  gradient = "from-zinc-400 to-zinc-500",
  fallbackClassName = "",
  fallbackSrc,
}: AvatarProps) {
  const [failedCount, setFailedCount] = useState(0);
  const [lastSrc, setLastSrc] = useState(src);

  if (src !== lastSrc) {
    setLastSrc(src);
    setFailedCount(0);
  }

  const sources = [src, fallbackSrc].filter(Boolean) as string[];
  const currentSrc = sources[failedCount];

  if (!currentSrc) {
    if (initials && initials.trim().length > 0) {
      return (
        <div
          className={`flex h-full w-full items-center justify-center bg-linear-to-br ${gradient} text-white font-bold ${fallbackClassName}`}
        >
          {initials}
        </div>
      );
    }
    return <div className={`h-full w-full bg-zinc-100 dark:bg-zinc-800 ${className ?? ""}`} />;
  }

  const isDataUri = currentSrc.startsWith("data:");

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      sizes={`${size}px`}
      unoptimized={isDataUri}
      onError={() => setFailedCount((c) => c + 1)}
      className={className}
    />
  );
}
