'use client';

import { useEffect, useRef } from 'react';

interface HtmlEmbedProps {
  html: string;
}

/**
 * Renders a raw HTML string and re-executes any <script> tags inside it.
 * React's dangerouslySetInnerHTML intentionally does NOT run scripts,
 * so we clone each script node and replace the original to trigger execution.
 */
export default function HtmlEmbed({ html }: HtmlEmbedProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const scripts = Array.from(container.querySelectorAll('script'));
    scripts.forEach((oldScript) => {
      const newScript = document.createElement('script');

      // Copy all attributes (e.g. src, type, defer)
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });

      // Copy inline script content
      if (oldScript.textContent) {
        newScript.textContent = oldScript.textContent;
      }

      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [html]);

  return (
    <div
      ref={ref}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
