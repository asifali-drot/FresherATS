"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Antigravity = dynamic(() => import("./Antigravity"), {
  ssr: false,
});

export default function AntigravityBackground(props: any) {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Defer Three.js loading until browser is idle to prioritize FCP/LCP
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => setShouldLoad(true), { timeout: 4000 });
      return () => cancelIdleCallback(id);
    } else {
      const timer = setTimeout(() => setShouldLoad(true), 3500);
      return () => clearTimeout(timer);
    }
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
