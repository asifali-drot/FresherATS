"use client";

import React, { useEffect, useRef, useState } from "react";

interface ATSScoreProps {
  score: number;
}

/* ─── helpers ─────────────────────────────────────────── */

function scoreToAngle(score: number): number {
  const clamped = Math.max(0, Math.min(100, score));
  return -180 + clamped * 1.8; // -180° (0) → 0° (100)
}

function polarToXY(
  angleDeg: number,
  r: number,
  cx: number,
  cy: number
): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  startDeg: number,
  endDeg: number,
  outerR: number,
  innerR: number,
  cx: number,
  cy: number
): string {
  const o1 = polarToXY(startDeg, outerR, cx, cy);
  const o2 = polarToXY(endDeg, outerR, cx, cy);
  const i1 = polarToXY(endDeg, innerR, cx, cy);
  const i2 = polarToXY(startDeg, innerR, cx, cy);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i2.x} ${i2.y}`,
    "Z",
  ].join(" ");
}

/* ─── status config ────────────────────────────────────── */

interface Status {
  text: string;
  hex: string;       // raw hex for SVG / inline styles
  tailwindBg: string;
  tailwindText: string;
  tailwindRing: string;
}

function getStatus(s: number): Status {
  if (s >= 85) return { text: "Excellent", hex: "#10b981", tailwindBg: "bg-emerald-500", tailwindText: "text-emerald-600", tailwindRing: "ring-emerald-200" };
  if (s >= 70) return { text: "Good", hex: "#22c55e", tailwindBg: "bg-green-500", tailwindText: "text-green-600", tailwindRing: "ring-green-200" };
  if (s >= 50) return { text: "Average", hex: "#f59e0b", tailwindBg: "bg-amber-500", tailwindText: "text-amber-600", tailwindRing: "ring-amber-200" };
  if (s >= 30) return { text: "Poor", hex: "#f97316", tailwindBg: "bg-orange-500", tailwindText: "text-orange-600", tailwindRing: "ring-orange-200" };
  return { text: "Very Poor", hex: "#ef4444", tailwindBg: "bg-red-500", tailwindText: "text-red-600", tailwindRing: "ring-red-200" };
}

/* ─── arc colour zones ──────────────────────────────────── */

const SEGMENTS = [
  { start: -180, end: -144, fill: "#ef4444", id: "seg0" }, // 0-20   red
  { start: -144, end: -108, fill: "#f97316", id: "seg1" }, // 20-40  orange
  { start: -108, end: -72, fill: "#eab308", id: "seg2" }, // 40-60  yellow
  { start: -72, end: -36, fill: "#84cc16", id: "seg3" }, // 60-80  lime
  { start: -36, end: 0, fill: "#22c55e", id: "seg4" }, // 80-100 green
];

/* Major tick marks at 0, 20, 40, 60, 80, 100 */
const TICK_SCORES = [0, 20, 40, 60, 80, 100];

/* ─── component ────────────────────────────────────────── */

export default function ATSScore({ score }: ATSScoreProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const [needleAngle, setNeedleAngle] = useState(-180);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const DURATION = 1500;

  useEffect(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    startRef.current = null;
    const targetAngle = scoreToAngle(score);

    function step(now: number) {
      if (!startRef.current) startRef.current = now;
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / DURATION, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      setNeedleAngle(-180 + eased * (targetAngle + 180));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    }

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current); };
  }, [score]);

  const status = getStatus(score);

  /* SVG constants */
  const W = 320;
  const H = 190;
  const CX = 160;
  const CY = 168;
  const OUTER_R = 138;
  const INNER_R = 98;
  const NEEDLE_LEN = 108;
  const NEEDLE_BASE = 7;
  const GLOW_R = OUTER_R + 12;

  /* Needle geometry */
  const tipRad = (needleAngle * Math.PI) / 180;
  const tipX = CX + NEEDLE_LEN * Math.cos(tipRad);
  const tipY = CY + NEEDLE_LEN * Math.sin(tipRad);
  const perpRad = ((needleAngle + 90) * Math.PI) / 180;
  const bLX = CX + NEEDLE_BASE * Math.cos(perpRad);
  const bLY = CY + NEEDLE_BASE * Math.sin(perpRad);
  const bRX = CX - NEEDLE_BASE * Math.cos(perpRad);
  const bRY = CY - NEEDLE_BASE * Math.sin(perpRad);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* ── Gauge SVG ── */}
      <div className="relative">
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          aria-label={`ATS Score: ${score}`}
          role="img"
        >
          <defs>
            {/* Subtle glow filter */}
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Needle shadow */}
            <filter id="needleShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f172a" floodOpacity="0.35" />
            </filter>

            {/* Hub glow */}
            <radialGradient id="hubGrad" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="100%" stopColor={status.hex} stopOpacity="0.9" />
            </radialGradient>
          </defs>

          {/* ── Outer glow ring (active colour) ── */}
          <path
            d={arcPath(-180, 0, GLOW_R, GLOW_R - 6, CX, CY)}
            fill="none"
            stroke={status.hex}
            strokeWidth="1"
            opacity="0.15"
          />

          {/* ── Background track ── */}
          <path
            d={arcPath(-180, 0, OUTER_R, INNER_R, CX, CY)}
            fill="#f1f5f9"
          />

          {/* ── Coloured segments ── */}
          {SEGMENTS.map((seg) => (
            <path
              key={seg.id}
              d={arcPath(seg.start, seg.end, OUTER_R, INNER_R, CX, CY)}
              fill={seg.fill}
              opacity={0.88}
            />
          ))}

          {/* ── Active-score highlight arc (animated) ── */}
          {needleAngle > -180 && (
            <path
              d={arcPath(-180, needleAngle, OUTER_R + 4, OUTER_R + 10, CX, CY)}
              fill={status.hex}
              opacity={0.35}
              filter="url(#glowFilter)"
            />
          )}

          {/* ── White divider lines ── */}
          {[-144, -108, -72, -36].map((angle, i) => {
            const inner = polarToXY(angle, INNER_R - 3, CX, CY);
            const outer = polarToXY(angle, OUTER_R + 3, CX, CY);
            return (
              <line
                key={i}
                x1={inner.x} y1={inner.y}
                x2={outer.x} y2={outer.y}
                stroke="white"
                strokeWidth={3}
              />
            );
          })}

          {/* ── Tick marks ── */}
          {TICK_SCORES.map((tickScore) => {
            const tickAngle = -180 + tickScore * 1.8;
            const inner = polarToXY(tickAngle, INNER_R - 14, CX, CY);
            const outer = polarToXY(tickAngle, INNER_R - 3, CX, CY);
            const label = polarToXY(tickAngle, INNER_R - 28, CX, CY);
            return (
              <g key={tickScore}>
                <line
                  x1={inner.x} y1={inner.y}
                  x2={outer.x} y2={outer.y}
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <text
                  x={label.x}
                  y={label.y + 4}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#64748b"
                  fontFamily="inherit"
                  fontWeight="600"
                >
                  {tickScore}
                </text>
              </g>
            );
          })}

          {/* ── Needle ── */}
          <polygon
            points={`${tipX},${tipY} ${bLX},${bLY} ${bRX},${bRY}`}
            fill="#0f172a"
            filter="url(#needleShadow)"
          />

          {/* ── Hub outer ring ── */}
          <circle cx={CX} cy={CY} r={16} fill={status.hex} opacity={0.18} />
          {/* ── Hub body ── */}
          <circle cx={CX} cy={CY} r={12} fill="#0f172a" />
          {/* ── Hub gloss dot ── */}
          <circle cx={CX} cy={CY} r={5} fill="url(#hubGrad)" />
        </svg>
      </div>

      {/* ── Score number ── */}
      <span
        className="text-5xl font-black tabular-nums leading-none tracking-tight -mt-3"
        style={{ color: status.hex }}
      >
        {displayScore}
      </span>

      {/* ── Status pill ── */}
      <div className="flex flex-col items-center gap-1">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest text-white ring-2 ring-offset-1 ${status.tailwindBg} ${status.tailwindRing}`}
        >
          {/* Pulsing dot */}
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${status.tailwindBg}`}
            />
            <span className={`relative inline-flex h-2 w-2 rounded-full bg-white`} />
          </span>
          {status.text}
        </span>
        {/* <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mt-1">
          ATS Score
        </p> */}

      </div>
    </div>
  );
}
