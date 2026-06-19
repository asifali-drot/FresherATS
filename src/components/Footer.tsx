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
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Company</h4>
            <nav className="flex flex-col gap-2.5">
              <Link href="/about" className="text-sm text-zinc-600 hover:text-blue-600 transition-colors">About Us</Link>
              <Link href="/contact" className="text-sm text-zinc-600 hover:text-blue-600 transition-colors">Contact Us</Link>
            </nav>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Support</h4>
            <nav className="flex flex-col gap-2.5">
              <Link href="/privacy" className="text-sm text-zinc-600 hover:text-blue-600 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-zinc-600 hover:text-blue-600 transition-colors">Terms of Service</Link>
            </nav>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Resources</h4>
            <nav className="flex flex-col gap-2.5">
              <Link href="/tips" className="text-sm text-zinc-600 hover:text-blue-600 transition-colors">ATS Tips</Link>
              <Link href="/guides" className="text-sm text-zinc-600 hover:text-blue-600 transition-colors">Resume Guides</Link>
              <Link href="/reviews" className="text-sm text-zinc-600 hover:text-blue-600 transition-colors">Reviews</Link>
            </nav>
          </div>

          {/* Download CTA (Result Page Only) — client island */}
          <FooterDownloadCTA />
        </div>

        <div className="mt-20 flex flex-col items-center justify-center border-t border-zinc-200 pt-8 md:flex-row">
          <p className="text-sm text-zinc-500">
            © {currentYear} FresherATS. All rights reserved.
          </p>
          <div className="mt-4 flex gap-6 md:mt-0">
            {/* Social links removed as per user request */}
          </div>
        </div>
      </div>
    </footer>
  );
}
