import type { Metadata } from "next";
import { Inter, Geist_Mono, DM_Sans, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-dm-serif-display",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
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
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} ${dmSans.variable} ${dmSerifDisplay.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
