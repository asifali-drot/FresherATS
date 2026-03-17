import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { logoutAction } from "./(auth)/actions";
import Antigravity from "@/components/Antigravity";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
          <Header user={user} logoutAction={logoutAction} />

          <main className="flex-1">
            {children}
          </main>

          <Footer />
        </div>
      </body>
    </html>
  );
}
