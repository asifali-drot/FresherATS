"use client";

import Link from "next/link";
import { User } from "@supabase/supabase-js";

export default function Header({ user, logoutAction }: { user: User | null, logoutAction: () => void }) {
  // pathname removed as it was unused

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-[#1a2b4b]">
            FresherATS
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/blog"
            className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/about"
            className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            About Us
          </Link>
          <Link
            href="/contact"
            className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Contact Us
          </Link>
          {/* <Link
            href="/privacy"
            className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Terms of Service
          </Link> */}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                href="/history"
                className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                History
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-sm font-semibold text-zinc-600 hover:text-zinc-900"
                >
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-semibold text-zinc-600 hover:text-zinc-900"
            >
              Login
            </Link>
          )}
          <Link
            href="/analyze"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-100"
          >
            Analyze Resume
          </Link>
        </div>
      </div>
    </header>
  );
}
