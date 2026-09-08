import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SmoothScroll } from "@/components/SmoothScroll";
import { VideoLoadGateReset } from "@/components/VideoLoadGateReset";
import { asset } from "@/lib/assets";
import "./globals.css";

const favicon = asset("/brand/favicon.svg");

/**
 * Home `/` only. Paints `edx-loading` before React so the veil covers first paint.
 * Inline in <head> (not next/script) — avoids React 19 / hydration script warnings.
 * Runs on every homepage load (local or remote) — speed follows how fast hero is ready.
 */
const EDX_LOADING_BOOT = `(function(){var p=location.pathname;if(p!=="/"&&p!=="")return;document.documentElement.classList.add("edx-loading");})();`;

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

/** Paint into iOS safe areas so the footer can cover the home-indicator gap */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {/* Must run before paint — raw head script, not next/script */}
        <script
          dangerouslySetInnerHTML={{ __html: EDX_LOADING_BOOT }}
          suppressHydrationWarning
        />
        {/* Chrome first — logo + menu weight before hero video competes for bandwidth */}
        <link
          rel="preload"
          href="/fonts/GrtskTera-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/fonts/FKGroteskMono-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/fonts/Grtsk-Medium.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/fonts/Grtsk-SemiBold.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/fonts/Grtsk-Light.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
          fetchPriority="high"
        />
        <link
          rel="preload"
          href="/fonts/Grtsk-Regular.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SmoothScroll>
          <VideoLoadGateReset />
          <Header />
          <div className="site-main">{children}</div>
          <div className="site-end">
            <Footer />
          </div>
        </SmoothScroll>
        {/* Fixed viewport bottom — soft edge blur as content scrolls past */}
        <div className="viewport-edge-blur" aria-hidden="true">
          <span className="viewport-edge-blur__layer viewport-edge-blur__layer--1" />
          <span className="viewport-edge-blur__layer viewport-edge-blur__layer--2" />
          <span className="viewport-edge-blur__layer viewport-edge-blur__layer--3" />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
