"use client";

import { useState, useEffect, type ComponentType } from "react";

export default function AntigravityBackground(props: any) {
  const [Antigravity, setAntigravity] = useState<ComponentType<any> | null>(null);

  useEffect(() => {
    // Delay the network download of Three.js to prioritize initial core bundles
    const timer = setTimeout(async () => {
      try {
        const { default: Component } = await import("./Antigravity");
        setAntigravity(() => Component);
      } catch (err) {
        console.error("Failed to load Antigravity background:", err);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`absolute inset-0 transition-opacity duration-1000 ${Antigravity ? 'opacity-100' : 'opacity-0'}`}>
      {Antigravity ? (
        <Antigravity {...props} />
      ) : (
        <div className="absolute inset-0 bg-transparent animate-pulse" />
      )}
    </div>
  );
}
