import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  compress: true,
  serverExternalPackages: ["pdfkit"],
  async redirects() {
    return [
      {
        source: "/free-ats-resume-checker",
        destination: "/#analyze",
        permanent: true,
      },
      {
        source: "/free-ats-resume-checker/result",
        destination: "/result",
        permanent: true,
      },
      {
        source: "/free-ats-resume-checker/editor",
        destination: "/editor",
        permanent: true,
      },
      {
        source: "/analyze",
        destination: "/#analyze",
        permanent: true,
      },
      {
        source: "/analyze/result",
        destination: "/result",
        permanent: true,
      },
      {
        source: "/analyze/editor",
        destination: "/editor",
        permanent: true,
      },
      {
        source: "/templates",
        destination: "/resume-templates",
        permanent: true,
      },
      {
        source: "/resume-templates/program-manager-resume-sample",
        destination: "/resume-templates/program-manager-resume-template",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
      ...(supabaseHost
        ? [{ protocol: 'https' as const, hostname: supabaseHost }]
        : []),
    ],
  },
};

export default nextConfig;
