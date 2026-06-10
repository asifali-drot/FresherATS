"use client";

import StarRating from "./StarRating";

interface ReviewCardProps {
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
  avatarUrl?: string;
}

const GRADIENT_PAIRS = [
  "from-purple-500 to-pink-500",
  "from-blue-500 to-cyan-400",
  "from-emerald-500 to-teal-400",
  "from-amber-500 to-orange-400",
  "from-rose-500 to-pink-400",
  "from-violet-500 to-indigo-400",
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENT_PAIRS[Math.abs(hash) % GRADIENT_PAIRS.length];
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return date.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

export default function ReviewCard({
  rating,
  comment,
  userName,
  createdAt,
  avatarUrl,
}: ReviewCardProps) {
  const initials = getInitials(userName);
  const gradient = getGradient(userName);

  return (
    <article className="group relative rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm hover:shadow-lg hover:border-purple-100 transition-all duration-300 flex flex-col">
      {/* Header: Avatar + Name + Time */}
      <div className="flex items-center gap-3 mb-4">
        {avatarUrl ? (
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-sm border border-zinc-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={userName}
              className="h-full w-full object-cover"
              onError={(e) => {
                const img = e.currentTarget;
                img.style.display = 'none';
                const fallback = img.nextElementSibling as HTMLElement | null;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div
              style={{ display: 'none' }}
              className={`absolute inset-0 flex items-center justify-center rounded-full bg-linear-to-br ${gradient} text-white text-xs font-bold`}
            >
              {initials}
            </div>
          </div>
        ) : (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${gradient} text-white text-xs font-bold shadow-sm`}
          >
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-zinc-900 truncate">{userName}</p>
          <p className="text-xs text-zinc-400">{formatRelativeTime(createdAt)}</p>
        </div>
      </div>

      {/* Stars */}
      <div className="mb-3">
        <StarRating rating={rating} size="sm" readonly />
      </div>

      {/* Comment */}
      <p className="text-sm text-zinc-600 leading-relaxed line-clamp-4 flex-1">
        {comment}
      </p>

      {/* Subtle bottom accent on hover */}
      <div className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full bg-linear-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </article>
  );
}
