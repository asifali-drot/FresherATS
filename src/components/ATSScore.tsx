"use client";

import React from "react";

interface ATSScoreProps {
  score: number;
}

export default function ATSScore({ score }: ATSScoreProps) {
  const getStatus = (s: number) => {
    if (s >= 85) return { text: "Excellent", color: "bg-green-500", icon: "✓" };
    if (s >= 75) return { text: "Good", color: "bg-blue-500", icon: "✓" };
    if (s >= 50) return { text: "Needs Improvement", color: "bg-amber-500", icon: "!" };
    return { text: "Poor", color: "bg-red-500", icon: "!" };
  };

  const status = getStatus(score);

  return (
    <div className="flex flex-col items-start gap-4 rounded-3xl bg-[#1c212e] p-8 text-white shadow-xl min-w-[240px]">
      <div className="flex flex-col gap-1">
        <span className="text-2xl font-bold tracking-tight">
          ATS Score: <span className="text-4xl">{score}</span>
        </span>
      </div>
      
      <div className={`flex items-center gap-2 rounded-full ${status.color} px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-black/10`}>
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px]">
          {status.icon}
        </span>
        {status.text}
      </div>
    </div>
  );
}
