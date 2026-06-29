import Link from "next/link";
import FooterDownloadCTA from "./FooterDownloadCTA";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-20 bg-[#f8f9fb] border-t border-zinc-100 pb-10 pt-20">
      {/* Floating Action Card */}

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">
          {/* Company */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Company</h3>
            <nav className="flex flex-col gap-2.5">
              <Link href="/about" className="text-sm text-zinc-600 hover:text-blue-600 transition-colors">About Us</Link>
              <Link href="/contact" className="text-sm text-zinc-600 hover:text-blue-600 transition-colors">Contact Us</Link>
            </nav>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Support</h3>
            <nav className="flex flex-col gap-2.5">
              <Link href="/privacy" className="text-sm text-zinc-600 hover:text-blue-600 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-zinc-600 hover:text-blue-600 transition-colors">Terms of Service</Link>
            </nav>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Resources</h3>
            <nav className="flex flex-col gap-2.5">
              <Link href="/tips" className="text-sm text-zinc-600 hover:text-blue-600 transition-colors">ATS Tips</Link>
              <Link href="/guides" className="text-sm text-zinc-600 hover:text-blue-600 transition-colors">Resume Guides</Link>
              <Link href="/reviews" className="text-sm text-zinc-600 hover:text-blue-600 transition-colors">Reviews</Link>
            </nav>
          </div>

          {/* Download CTA (Result Page Only) — client island */}
          <FooterDownloadCTA />
        </div>

        <div className="mt-20 flex flex-col items-center justify-center gap-6 border-t border-zinc-200 pt-8 md:flex-row md:gap-8">
          <p className="text-sm text-zinc-500">
            © {currentYear} FresherATS. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="https://www.facebook.com/fresherats/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-600 transition-colors">
              <span className="sr-only">Facebook</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/company/fresherats" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-700 transition-colors">
              <span className="sr-only">LinkedIn</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
