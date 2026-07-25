"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { useState, useEffect, useRef, useTransition } from "react";
import { Menu, X, LayoutDashboard, User as UserIcon, LogOut, Loader2, ChevronDown, Sparkles, Layout, Linkedin, Briefcase, Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { logoutAction } from "@/app/(website)/(auth)/actions";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const [isMobileCoverLetterOpen, setIsMobileCoverLetterOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();

  // Fetch user client-side to avoid blocking server render (FCP optimization)
  useEffect(() => {
    const supabase = createClient();

    // Initial fetch
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname]);

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

  const [isPendingLogout, startLogoutTransition] = useTransition();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsMobileToolsOpen(false);
    setIsMobileCoverLetterOpen(false);
  };
  const toggleProfileDropdown = () => setIsProfileDropdownOpen(!isProfileDropdownOpen);
  const closeProfileDropdown = () => setIsProfileDropdownOpen(false);

  const toggleMobileDropdown = (dropdown: "tools" | "coverLetter") => {
    if (dropdown === "tools") {
      setIsMobileToolsOpen((prev) => !prev);
      setIsMobileCoverLetterOpen(false);
    } else {
      setIsMobileCoverLetterOpen((prev) => !prev);
      setIsMobileToolsOpen(false);
    }
  };

  const handleLogout = () => {
    closeProfileDropdown();
    closeMenu();
    startLogoutTransition(() => logoutAction());
  };

  // Get user profile data
  const metadata = user?.user_metadata || {};
  const avatarUrl = metadata.avatar_url || '';
  const firstName = metadata.first_name || '';
  const lastName = metadata.last_name || '';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';

  return (
    <>
      <header className="sticky top-0 z-1001 border-b border-zinc-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-0 lg:py-2">
          {/* Mobile logo — clean, no clipping */}
          <Link href="/" className="flex items-center group z-120 relative lg:hidden">
            <Image
              src="/logo.svg"
              alt="FresherATS Logo"
              width={200}
              height={67}
              className="h-22 w-auto object-contain group-hover:scale-105 transition-transform"
              priority
            />
          </Link>
          {/* Desktop logo — clipped to reduce header height */}
          <Link href="/" className="hidden lg:flex items-center group z-120 relative overflow-hidden" style={{ height: '60px' }}>
            <Image
              src="/logo.svg"
              alt="FresherATS Logo"
              width={450}
              height={150}
              className="h-36.25 w-auto object-contain group-hover:scale-105 transition-transform -my-10"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-9 lg:flex">
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
            <div className="relative group py-2">
              <button className="flex items-center gap-1 text-sm font-bold text-zinc-600 group-hover:text-blue-600 transition-colors cursor-pointer focus:outline-none">
                Tools
                <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-blue-500 transition-colors" />
              </button>

              <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white p-3 shadow-xl border border-zinc-100 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-1002">
                <Link
                  href="/resume-templates"
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/50 hover:text-blue-600 transition-colors"
                >
                  <Layout className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-extrabold text-zinc-900">Resume Templates</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-medium">Browse ATS-friendly resume templates and layouts.</div>
                  </div>
                </Link>
                <Link
                  href="/linkedin-checker"
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/50 hover:text-[#0077B5] transition-colors mt-1"
                >
                  <Linkedin className="h-5 w-5 text-[#0077B5] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-extrabold text-zinc-900">LinkedIn Checker</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-medium">Analyze and improve your LinkedIn profile for recruiters.</div>
                  </div>
                </Link>
                <Link
                  href="/keyword-packs"
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/50 hover:text-blue-600 transition-colors mt-1"
                >
                  <Building2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-extrabold text-zinc-900">Company Match</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-medium">Score your resume against specific employer hiring patterns.</div>
                  </div>
                </Link>
                <Link
                  href="/job-tracker"
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/50 hover:text-blue-600 transition-colors mt-1"
                >
                  <Briefcase className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-extrabold text-zinc-900">Job Tracker</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-medium">Track applications, follow-ups, and interview stages.</div>
                  </div>
                </Link>
              </div>
            </div>
            <div className="relative group py-2">
              <button className="flex items-center gap-1 text-sm font-bold text-zinc-600 group-hover:text-blue-600 transition-colors cursor-pointer focus:outline-none">
                Cover Letter
                <ChevronDown className="h-4 w-4 text-zinc-400 group-hover:text-blue-500 transition-colors" />
              </button>

              {/* Cover Letter Dropdown Menu */}
              <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white p-3 shadow-xl border border-zinc-100 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-1002">
                <Link
                  href="/ai-cover-letter-generator?action=new"
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/50 hover:text-blue-600 transition-colors"
                >
                  <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-extrabold text-zinc-900">AI Cover Letter Generator</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-medium">Create tailored letters matching your resume to jobs.</div>
                  </div>
                </Link>
                <Link
                  href="/cover-letter-templates"
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-blue-50/50 hover:text-blue-600 transition-colors mt-1"
                >
                  <Layout className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-extrabold text-zinc-900">Cover Letter Templates</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5 leading-relaxed font-medium">Browse clean, ATS-compliant designs to edit manually.</div>
                  </div>
                </Link>
              </div>
            </div>
            <Link
              href="/pricing"
              className="text-sm font-bold text-zinc-600 hover:text-blue-600 transition-colors"
            >
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3">
              {!isLoading && !user && (
                <Link
                  href="/#analyze"
                  className="inline-flex items-center rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-100"
                >
                  Analyze My Resume
                </Link>
              )}
              {!isLoading && (
                <>
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
                              href="/dashboard"
                              onClick={closeProfileDropdown}
                              className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <LayoutDashboard className="h-4 w-4" />
                              Dashboard
                            </Link>
                            <Link
                              href="/job-tracker"
                              onClick={closeProfileDropdown}
                              className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                              <Briefcase className="h-4 w-4" />
                              Job Tracker
                            </Link>
                          </div>

                          {/* Logout Button */}
                          <div className="border-t border-zinc-100 py-2">
                            <button
                              type="button"
                              onClick={handleLogout}
                              disabled={isPendingLogout}
                              className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {isPendingLogout ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <LogOut className="h-4 w-4" />
                              )}
                              {isPendingLogout ? "Logging out…" : "Logout"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href="/signup"
                      className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2 rounded-lg px-4 py-2"                >
                      Sign up free
                    </Link>
                  )}
                </>
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
      </header >

      {/* Backdrop for Mobile Menu */}
      < div
        className={`fixed inset-0 z-998 bg-zinc-900/20 backdrop-blur-sm transition-opacity lg:hidden ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`
        }
        onClick={closeMenu}
      />

      {/* Mobile Navigation Drawer */}
      < div
        className={`fixed left-0 top-16 max-h-[80vh] z-999 w-[75vw] sm:w-96 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden border-r border-zinc-100 overflow-y-auto ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col bg-white">
          <div className="flex flex-col gap-1 p-6">
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Main Menu</p>
            <MobileNavLink href="/" label="Home" onClick={closeMenu} />
            <MobileNavLink href="/blog" label="Blog" onClick={closeMenu} />

            <button onClick={() => toggleMobileDropdown("tools")} className="flex items-center justify-between px-4 py-4 rounded-2xl text-base font-bold text-zinc-700 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100 w-full">
              Tools
              <ChevronDown className={`h-4 w-4 transition-transform ${isMobileToolsOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMobileToolsOpen && (
              <div className="flex flex-col gap-1 pl-4">
                <MobileNavLink href="/resume-templates" label="Templates" onClick={closeMenu} />
                <MobileNavLink href="/linkedin-checker" label="LinkedIn Checker" onClick={closeMenu} />
                <MobileNavLink href="/keyword-packs" label="Company Match" onClick={closeMenu} />
                <MobileNavLink href="/job-tracker" label="Job Tracker" onClick={closeMenu} />
              </div>
            )}

            <button onClick={() => toggleMobileDropdown("coverLetter")} className="flex items-center justify-between px-4 py-4 rounded-2xl text-base font-bold text-zinc-700 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100 w-full">
              Cover Letter
              <ChevronDown className={`h-4 w-4 transition-transform ${isMobileCoverLetterOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMobileCoverLetterOpen && (
              <div className="flex flex-col gap-1 pl-4">
                <MobileNavLink href="/ai-cover-letter-generator?action=new" label="AI Cover Letter Generator" onClick={closeMenu} />
                <MobileNavLink href="/cover-letter-templates" label="Cover Letter Templates" onClick={closeMenu} />
              </div>
            )}

            <MobileNavLink href="/pricing" label="Pricing" onClick={closeMenu} />
            {/* <MobileNavLink href="/contact" icon={<Mail className="h-5 w-5" />} label="Contact Us" onClick={closeMenu} /> */}
            {user && (
              <>
                <MobileNavLink href="/profile" label="Profile" onClick={closeMenu} />
                <MobileNavLink href="/dashboard" label="Dashboard" onClick={closeMenu} />
              </>
            )}

          </div>

          <div className="mt-auto p-6 border-t border-zinc-100 flex flex-col gap-4 bg-zinc-50/50">
            <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2">Account</p>
            {!isLoading && (
              <>
                {user ? (
                  <div className="flex flex-col gap-2">

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isPendingLogout}
                      className="flex items-center gap-4 w-full p-4 rounded-2xl bg-white border border-zinc-200 text-zinc-700 font-bold hover:bg-red-50 hover:text-red-600 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isPendingLogout ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      <span className="text-sm">{isPendingLogout ? "Logging out…" : "Logout"}</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/#analyze"
                      onClick={closeMenu}
                      className="flex w-full items-center justify-center rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors p-4 text-sm font-bold shadow-sm"
                    >
                      Analyze My Resume
                    </Link>
                    <Link
                      onClick={closeMenu}
                      href="/signup"
                      className="flex w-full items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-700 transition-colors p-4 text-sm font-bold text-white shadow-sm"
                    >
                      Sign up free
                    </Link>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div >
    </>
  );
}

function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center px-4 py-4 rounded-2xl text-base font-bold text-zinc-700 hover:bg-blue-50 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
    >
      {label}
    </Link>
  );
}
