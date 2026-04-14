"use client";

import { useEffect, useState } from "react";

/**
 * Hook to determine if the component has mounted on the client.
 * Useful for avoiding hydration mismatches when rendering environment-specific data.
 */
export function useIsMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
