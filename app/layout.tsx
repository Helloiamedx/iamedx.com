import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SmoothScroll } from "@/components/SmoothScroll";
import { asset } from "@/lib/assets";
import "./globals.css";

const favicon = asset("/brand/favicon.svg");

export const metadata: Metadata = {
  title: {
    default:
      "Edward Xu | End-to-End Product Development & Manufacturing Partner",
    template: "%s · Edward Xu",
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
        <link
          rel="preload"
          href="/brand/edxlogo-white.svg"
          as="image"
          type="image/svg+xml"
        />
        <link
          rel="preload"
          href="/brand/edxlogo-black.svg"
          as="image"
          type="image/svg+xml"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SmoothScroll>
          <Header />
          <div className="site-main">{children}</div>
          <Footer />
        </SmoothScroll>
        <Analytics />
      </body>
    </html>
  );
}
