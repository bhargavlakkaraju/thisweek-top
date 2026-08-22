import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

const base = process.env.NEXT_PUBLIC_APP_URL || "https://111111.live";

export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: {
    default: "111111.live - six prices, one ladder",
    template: "%s",
  },
  description:
    "A paid placement board priced in ones: $1, $11, $111, $1,111, $11,111, $111,111. Pick a rung, pay once, hold it for the whole term. No bidding, no being outbid.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "111111.live",
    title: "111111.live - six prices, one ladder",
    description:
      "Six prices. Six terms. Finite seats. Pay once and hold your rung - nobody can outbid you off it.",
    url: base,
  },
  twitter: {
    card: "summary_large_image",
    title: "111111.live - six prices, one ladder",
    description:
      "$1, $11, $111, $1,111, $11,111, $111,111. Pick a rung, hold it for the term.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "111111.live",
    url: base,
    description:
      "A paid placement board where rank is set by which of six fixed price bands a listing bought.",
  };

  return (
    <html lang="en" className={`${dmSans.variable} ${geistMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
        />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
