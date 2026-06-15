"use client";

import React, { useEffect, useRef, useState } from "react";

interface LinkedInScoreBarProps {
  score: number;
  label: string;
  colorClass?: string; // tailwind bg class e.g. "bg-blue-500"
  delay?: number; // ms animation delay
}

export default function LinkedInScoreBar({
  score,
  label,
  colorClass = "bg-blue-500",
  delay = 0,
}: LinkedInScoreBarProps) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const DURATION = 1200;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      startRef.current = null;

      function step(now: number) {
        if (!startRef.current) startRef.current = now;
        const elapsed = now - startRef.current;
        const progress = Math.min(elapsed / DURATION, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayed(Math.round(eased * score));
        if (progress < 1) rafRef.current = requestAnimationFrame(step);
      }

      rafRef.current = requestAnimationFrame(step);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [score, delay]);

  const getColor = (s: number) => {
    if (s >= 80) return "bg-emerald-500";
    if (s >= 60) return "bg-blue-500";
    if (s >= 40) return "bg-amber-500";
    return "bg-red-500";
  };

  const barColor = colorClass !== "bg-blue-500" ? colorClass : getColor(score);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-zinc-700">{label}</span>
        <span className="text-sm font-black tabular-nums text-zinc-900">{displayed}%</span>
      </div>
      <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-none ${barColor}`}
          style={{ width: `${displayed}%` }}
        />
      </div>
    </div>
  );
}
