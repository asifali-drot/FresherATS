'use client';

import { useMemo } from 'react';
import { NextStudio } from 'next-sanity/studio';
import config from '../../../../sanity.config';

export default function StudioPage() {
  const isClient = useMemo(() => typeof window !== 'undefined', []);

  if (!isClient) return null;

  return <NextStudio config={config} />;
}
