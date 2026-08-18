"use client";

import { usePathname } from "next/navigation";
import { FAQ } from "@/components/ui/faq-tabs";
import { siteFaqCategories, siteFaqData } from "@/content/faq";

/**
 * Global FAQ strip — black band continuous with the footer.
 * Hidden on home (`/`) only.
 */
export function SiteFaq() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <div className="site-faq">
      <FAQ
        title="Questions You May Ask"
        categories={siteFaqCategories}
        faqData={siteFaqData}
        className="site-faq__inner"
        aria-label="Questions you may ask"
      />
    </div>
  );
}
