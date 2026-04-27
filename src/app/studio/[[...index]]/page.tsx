"use client";
 
import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";
import { useIsMounted } from "@/hooks/useIsMounted";
 
export default function StudioPage() {
  const mounted = useIsMounted();
 
  if (!mounted) return null;
 
  return <NextStudio config={config} />;
}

