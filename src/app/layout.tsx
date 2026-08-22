import type { Metadata } from "next";
import { DM_Sans, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ThisWeek.top - weekly pay-to-rank board",
  description:
    "Public USD weekly pay-to-rank board. Resets every Monday 00:00 UTC. Bid = rank. Listing = product URL or X @handle.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000",
  ),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${geistMono.variable}`}>
      <body>
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
