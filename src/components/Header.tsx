"use client";

import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Zap, FileText, Info, Rss, LayoutDashboard, Star, User as UserIcon, LogOut } from "lucide-react";

export default function Header({ user, logoutAction }: { user: User | null, logoutAction: () => void }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMenuOpen]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);
  const closeProfileDropdown = () => setIsProfileDropdownOpen(false);

  // Get user profile data
  const metadata = user?.user_metadata || {};
  const avatarUrl = metadata.avatar_url || '';
  const firstName = metadata.first_name || '';
  const lastName = metadata.last_name || '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';

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
              href="/resume-templates"
              className="text-sm font-bold text-zinc-600 hover:text-blue-600 transition-colors"
            >
              Templates
            </Link>
            <Link
              href="/reviews"
              className="text-sm font-bold text-zinc-600 hover:text-blue-600 transition-colors"
            >
              Reviews
            </Link>
            <Link
              href="/about"
              className="text-sm font-bold text-zinc-600 hover:text-blue-600 transition-colors"
            >
              About Us
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-6">
              {user ? (
                <div className="relative" ref={profileDropdownRef}>
                  {/* Profile Image Button */}
                  <button
                    onClick={toggleProfileDropdown}
                    className="relative flex items-center justify-center h-10 w-10 rounded-full border-2 border-zinc-200 hover:border-blue-400 transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-white"
                    aria-label="Profile menu"
                  >
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="Profile" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-cyan-400 text-white text-xs font-bold">
                        {initials}
                      </div>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden z-1002 animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50">
                        <p className="text-sm font-semibold text-zinc-900">{firstName} {lastName}</p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          href="/profile"
                          onClick={closeProfileDropdown}
                          className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <UserIcon className="h-4 w-4" />
                          Edit Profile
                        </Link>
                        <Link
                          href="/my-resumes"
                          onClick={closeProfileDropdown}
                          className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          My Resumes
                        </Link>
                      </div>

                      {/* Logout Button */}
                      <div className="border-t border-zinc-100 py-2">
                        <form action={logoutAction} className="w-full">
                          <button
                            type="submit"
                            onClick={closeProfileDropdown}
                            className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-bold text-zinc-600 hover:text-blue-600 transition-colors flex items-center gap-2"
                >
                  Login
                </Link>
              )}
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
        className={`fixed inset-0 z-998 bg-zinc-900/20 backdrop-blur-sm transition-opacity lg:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={closeMenu}
      />

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed right-0 top-18.25 bottom-0 z-999 w-[50vw] sm:w-1/2 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden border-l border-zinc-100 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full bg-white overflow-y-auto">
          <div className="flex flex-col gap-1 p-6">
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Main Menu</p>
            <MobileNavLink href="/" icon={<Zap className="h-5 w-5" />} label="Home" onClick={closeMenu} />
            <MobileNavLink href="/blog" icon={<Rss className="h-5 w-5" />} label="Blog" onClick={closeMenu} />
            <MobileNavLink href="/resume-templates" icon={<FileText className="h-5 w-5" />} label="Templates" onClick={closeMenu} />
            <MobileNavLink href="/reviews" icon={<Star className="h-5 w-5" />} label="Reviews" onClick={closeMenu} />
            <MobileNavLink href="/about" icon={<Info className="h-5 w-5" />} label="About Us" onClick={closeMenu} />
            {/* <MobileNavLink href="/contact" icon={<Mail className="h-5 w-5" />} label="Contact Us" onClick={closeMenu} /> */}
            {user && (
              <>
                <MobileNavLink href="/profile" icon={<UserIcon className="h-5 w-5" />} label="Profile" onClick={closeMenu} />
                <MobileNavLink href="/my-resumes" icon={<LayoutDashboard className="h-5 w-5" />} label="My Resumes" onClick={closeMenu} />
              </>
            )}

          </div>

          <div className="mt-auto p-6 border-t border-zinc-100 flex flex-col gap-4 bg-zinc-50/50">
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Account</p>
            {user ? (
              <div className="flex flex-col gap-2">

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
