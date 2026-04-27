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
  metadataBase: new URL("https://fresherats.com"),
  title: {
    default: "FresherATS | Master Your Resume",
    template: "%s | FresherATS",
  },
  description: "Advanced ATS resume analyzer for fresh graduates. Optimize your career path with AI-driven insights.",
  keywords: ["ATS Resume Analyzer", "Fresher Resume", "Resume Optimization", "AI Career Help", "Free ATS Checker"],
  authors: [{ name: "FresherATS Team" }],
  creator: "FresherATS",
  publisher: "FresherATS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://fresherats.com",
    siteName: "FresherATS",
    title: "FresherATS | Master Your Resume",
    description: "Advanced ATS resume analyzer for fresh graduates. Optimize your career path with AI-driven insights.",
    images: [
      {
        url: "/og-image.png",
        width: 1995,
        height: 528,
        alt: "FresherATS - Master Your Resume",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FresherATS | Master Your Resume",
    description: "Advanced ATS resume analyzer for fresh graduates. Optimize your career path with AI-driven insights.",
    images: ["/og-image.png"],
    creator: "@fresherats",
  },
  verification: {
    google: "5BxzQElKJd_onGdtdvBwmM8enJ7Aw1nlzguTXZXNgUc",
    other: {
      "p:domain_verify": "e6ae17b1e04ef0ba38b7f3b337baf62a",
    },
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
        <meta name="p:domain_verify" content="e6ae17b1e04ef0ba38b7f3b337baf62a"/>
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="preconnect" href="https://images.unsplash.com" />
      </head>
      <body
        className={`${inter.variable} ${geistMono.variable} ${dmSans.variable} ${dmSerifDisplay.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
