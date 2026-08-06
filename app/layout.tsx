import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
