"use client";

import { useEffect, useMemo, useState } from "react";

export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showMobileBar, setShowMobileBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show bar after scrolling 400px (approx past title and image)
      setShowMobileBar(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const ids = useMemo(() => items.map((i) => i.id), [items]);

  useEffect(() => {
    if (!ids.length) return;

    const headings = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the top-most visible heading.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top ?? 0) - (b.boundingClientRect.top ?? 0));
        if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
      },
      {
        root: null,
        // Account for sticky site header.
        rootMargin: "-96px 0px -70% 0px",
        threshold: [0, 1.0],
      }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [ids]);

  if (!items.length) return null;

  const list = (
    <nav aria-label="Table of contents" className="space-y-1">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              scrollToId(item.id);
              setMobileOpen(false);
            }}
            className={[
              "w-full text-left rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              item.level === 3 ? "pl-6 text-[13px] font-medium" : "",
              item.level === 4 ? "pl-9 text-[13px] font-medium" : "",
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
            ].join(" ")}
          >
            {item.text}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Sticky Bar - Fixed at top for better navigation, shown on scroll */}
      <div className={[
        "lg:hidden fixed top-[73px] left-0 right-0 z-40 px-6 py-3 bg-white/80 backdrop-blur-md border-b border-zinc-100 shadow-sm transition-all duration-300",
        showMobileBar ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      ].join(" ")}>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="w-full flex items-center justify-between px-4 py-2 bg-zinc-50 rounded-xl text-sm font-bold text-zinc-900 border border-zinc-200"
          aria-haspopup="dialog"
          aria-expanded={mobileOpen}
        >
          <span className="flex items-center gap-2">
            <div className="w-1 h-4 bg-blue-600 rounded-full" />
            Table of contents
          </span>
          <span className="text-xs font-bold text-blue-600 px-2 py-1 bg-blue-50 rounded-lg">View</span>
        </button>
      </div>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="Table of contents"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-zinc-900/30 backdrop-blur-sm" />
          <div
            className="absolute left-1/2 top-24 w-[min(92vw,520px)] -translate-x-1/2 rounded-2xl border border-zinc-100 bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
              <div className="text-sm font-extrabold text-zinc-900">On this page</div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="text-xs font-bold text-zinc-500 hover:text-zinc-900"
              >
                Close
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto px-3 py-3">{list}</div>
          </div>
        </div>
      )}

      {/* Desktop - Handled by sticky aside in page.tsx */}
      <div className="hidden lg:block h-full">
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto pr-4 scrollbar-thin">
          <div className="mb-6 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-400">On this page</h3>
          </div>
          {list}
        </div>
      </div>
    </>
  );
}

