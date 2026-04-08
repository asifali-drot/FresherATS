"use client";

import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { useState, useEffect } from "react";
import { Menu, X, Zap, History, FileText, Info, Mail, Rss, Sparkles } from "lucide-react";

export default function Header({ user, logoutAction }: { user: User | null, logoutAction: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-1001 border-b border-zinc-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 group z-120 relative">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
              <Zap className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#1a2b4b]">
              FresherATS
            </span>
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            <Link
              href="/"
              className="text-sm font-bold text-zinc-600 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="text-sm font-bold text-zinc-600 hover:text-blue-600 transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/about"
              className="text-sm font-bold text-zinc-600 hover:text-blue-600 transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-sm font-bold text-zinc-600 hover:text-blue-600 transition-colors"
            >
              Contact Us
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-6">
              {user ? (
                <div className="flex items-center gap-6">
                  {/* <Link
                    href="/history"
                    className="text-sm font-bold text-zinc-600 hover:text-blue-600 transition-colors flex items-center gap-2"
                  >
                    <History className="h-4 w-4" />
                    History
                  </Link> */}
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="text-sm font-bold text-zinc-600 hover:text-red-600 transition-colors flex items-center gap-2"
                    >
                      Logout
                    </button>
                  </form>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-bold text-zinc-600 hover:text-blue-600 transition-colors flex items-center gap-2"
                >
                  Login
                </Link>
              )}

              <Link
                href="/templates"
                className="flex items-center gap-2 text-sm font-extrabold text-zinc-700 hover:text-blue-600 transition-colors"
              >
                Templates <FileText className="h-4 w-4" />
              </Link>

              <Link
                href="/analyze"
                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-extrabold text-white hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100"
              >
                Analyze Resume
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleMenu}
              className="lg:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors z-120 relative"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Backdrop for Mobile Menu */}
      <div
        className={`fixed inset-0 z-998 bg-zinc-900/20 backdrop-blur-sm transition-opacity lg:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        onClick={closeMenu}
      />

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed right-0 top-18.25 bottom-0 z-999 w-[50vw] sm:w-1/2 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden border-l border-zinc-100 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        <div className="flex flex-col h-full bg-white overflow-y-auto">
          <div className="flex flex-col gap-1 p-6">
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Main Menu</p>
            <MobileNavLink href="/" icon={<Zap className="h-5 w-5" />} label="Home" onClick={closeMenu} />
            <MobileNavLink href="/blog" icon={<Rss className="h-5 w-5" />} label="Blog" onClick={closeMenu} />
            <MobileNavLink href="/about" icon={<Info className="h-5 w-5" />} label="About Us" onClick={closeMenu} />
            <MobileNavLink href="/contact" icon={<Mail className="h-5 w-5" />} label="Contact Us" onClick={closeMenu} />

              <div className="px-4 pt-3 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Templates</div>
              <MobileNavLink href="/templates" icon={<FileText className="h-5 w-5" />} label="Browse Templates" onClick={closeMenu} />
          </div>

          <div className="mt-auto p-6 border-t border-zinc-100 flex flex-col gap-4 bg-zinc-50/50">
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Account</p>
            {user ? (
              <div className="flex flex-col gap-2">
                <Link
                  onClick={closeMenu}
                  href="/history"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-zinc-200 text-zinc-700 font-bold hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
                >
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <History className="h-5 w-5" />
                  </div>
                  <span className="text-sm">History</span>
                </Link>
                <form action={logoutAction} className="w-full">
                  <button
                    type="submit"
                    className="flex items-center gap-4 w-full p-4 rounded-2xl bg-white border border-zinc-200 text-zinc-700 font-bold hover:bg-red-50 hover:text-red-600 transition-all shadow-sm"
                  >
                    <span className="text-sm">Logout</span>
                  </button>
                </form>
              </div>
            ) : (
              <Link
                onClick={closeMenu}
                href="/login"
                className="group flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-zinc-200/60 bg-white/80 p-4 text-sm font-bold text-zinc-700 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              >
                {/* <LogIn className="h-5 w-5 text-zinc-400 group-hover:text-blue-500 transition-colors" /> */}
                <span>Login</span>
              </Link>
            )}
            <Link
              onClick={closeMenu}
              href="/analyze"
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 p-4 text-sm font-black text-white shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] hover:shadow-blue-600/30 active:scale-[0.98]"
            >
              <Sparkles className="h-5 w-5 animate-pulse text-blue-200" />
              <span>Analyze Resume</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function MobileNavLink({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-5 px-4 py-4 rounded-2xl text-base font-bold text-zinc-700 hover:bg-blue-50 hover:text-blue-600 transition-all group border border-transparent hover:border-blue-100"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-50 text-zinc-700 group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm group-hover:border group-hover:border-blue-100 transition-all">
        {icon}
      </div>
      {label}
    </Link>
  );
}
