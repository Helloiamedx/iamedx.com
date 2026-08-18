import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SiteFaq } from "@/components/SiteFaq";
import { SmoothScroll } from "@/components/SmoothScroll";
import { asset } from "@/lib/assets";
import "./globals.css";

const favicon = asset("/brand/favicon.svg");

export const metadata: Metadata = {
  title: {
    default:
      "Edward Xu | End-to-End Product Development & Manufacturing Partner",
    template: "Edward Xu · %s",
  },
  description:
    "Driven by loyalty, transparency, and a commitment to exceed expectations, I help clients build highly tailored supply chains in China.",
  icons: {
    icon: [{ url: favicon, type: "image/svg+xml", sizes: "any" }],
    apple: [{ url: favicon, type: "image/svg+xml" }],
    shortcut: favicon,
  },
};

/** Paint into iOS safe areas so the black footer can cover the home-indicator gap */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Chrome first — logos + menu weight before hero video competes for bandwidth */}
        <link
          rel="preload"
          href={asset("/brand/iamedwardxu-logo-white.svg")}
          as="image"
          type="image/svg+xml"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href={asset("/brand/iamedwardxu-logo-black.svg")}
          as="image"
          type="image/svg+xml"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href={asset("/fonts/SF-Pro-Display-Medium.woff2")}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href={asset("/fonts/SF-Pro-Display-Bold.woff2")}
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          fetchPriority="high"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SmoothScroll>
          <Header />
          <div className="site-main">{children}</div>
          <SiteFaq />
          <Footer />
        </SmoothScroll>
        <Analytics />
      </body>
    </html>
  );
}
