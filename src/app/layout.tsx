import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FresherATS | Master Your Resume",
  description: "Advanced ATS resume analyzer for fresh graduates. Optimize your career path with AI-driven insights.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  verification: {
    google: "5BxzQElKJd_onGdtdvBwmM8enJ7Aw1nlzguTXZXNgUc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* <meta name="google-site-verification" content="5BxzQElKJd_onGdtdvBwmM8enJ7Aw1nlzguTXZXNgUc" /> */}
      <meta name="google-site-verification" content="5BxzQElKJd_onGdtdvBwmM8enJ7Aw1nlzguTXZXNgUc" />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
