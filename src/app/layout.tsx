import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "./(auth)/actions";
import Antigravity from "@/components/Antigravity";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FresherATS | Master Your Resume",
  description: "Advanced ATS resume analyzer for fresh graduates. Optimize your career path with AI-driven insights.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-zinc-900 selection:bg-purple-100`}
      >
        {/* Antigravity Background */}
        <div className="fixed inset-0 -z-10 pointer-events-none opacity-20">
          <Antigravity
            count={350}
            color="#9333EA"
            particleSize={1.1}
            magnetRadius={10}
            autoAnimate={true}
          />
        </div>

        <div className="flex min-h-screen flex-col relative z-0">
          <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
                  <span className="relative rounded bg-white px-3 py-1 text-sm font-bold tracking-tight text-zinc-900 border border-zinc-200 shadow-sm">
                    FresherATS
                  </span>
                </div>
                <span className="hidden text-sm font-medium text-zinc-500 group-hover:text-zinc-700 transition-colors sm:inline">
                  AI Resume Catalyst
                </span>
              </Link>
              <nav className="flex items-center gap-7">
                <Link
                  href="/analyze"
                  className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  Analyze
                </Link>
                {user ? (
                  <div className="flex items-center gap-7">
                    <span className="hidden text-sm font-medium text-zinc-500 sm:inline">
                      Hi, {user.user_metadata?.first_name || 'Innovator'}
                    </span>
                    <Link
                      href="/history"
                      className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
                    >
                      History
                    </Link>
                    <form action={logoutAction}>
                      <button
                        type="submit"
                        className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-sm font-bold text-zinc-800 hover:bg-zinc-50 hover:border-zinc-300 active:scale-95 transition-all shadow-sm"
                      >
                        Logout
                      </button>
                    </form>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-zinc-800 active:scale-95 transition-all shadow-lg shadow-zinc-200"
                  >
                    Login
                  </Link>
                )}
              </nav>
            </div>
          </header>

          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
