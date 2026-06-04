"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
}

const SIZES = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
};

export default function StarRating({
  rating,
  onChange,
  size = "md",
  readonly = false,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const displayRating = hovered || rating;
  const sizeClass = SIZES[size];

  return (
    <div
      className={`inline-flex items-center gap-0.5 ${
        readonly ? "" : "cursor-pointer"
      }`}
      onMouseLeave={() => !readonly && setHovered(0)}
      role={readonly ? "img" : "radiogroup"}
      aria-label={`Rating: ${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayRating;
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            className={`
              relative transition-all duration-150 ease-out
              ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110 active:scale-95"}
              ${isFilled ? "text-amber-400" : "text-zinc-200"}
              disabled:opacity-100
              focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-1 rounded-sm
            `}
            aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          >
            <Star
              className={`${sizeClass} transition-colors duration-150 ${
                isFilled ? "fill-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.4)]" : "fill-transparent"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
