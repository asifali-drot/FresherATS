"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Antigravity = dynamic(() => import("./Antigravity"), {
  ssr: false,
});

export default function AntigravityBackground(props: any) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Delay the network download of Three.js to prioritize initial core bundles
    const timer = setTimeout(() => {
      setShouldLoad(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`absolute inset-0 transition-opacity duration-1000 ${shouldLoad ? 'opacity-100' : 'opacity-0'}`}>
      {shouldLoad ? (
        <Antigravity {...props} />
      ) : (
        <div className="absolute inset-0 bg-transparent animate-pulse" />
      )}
    </div>
  );
}
