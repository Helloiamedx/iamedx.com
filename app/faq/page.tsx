import type { Metadata } from "next";
import { FaqPageHero } from "@/components/FaqPageHero";
import { FAQ } from "@/components/ui/faq-tabs";
import {
  siteFaqCategories,
  siteFaqData,
  siteFaqTitle,
} from "@/content/faq";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Common questions about working with Edward Xu on product development, manufacturing, and supply chain in China.",
};

export default function FaqPage() {
  return (
    <main className="faq-page">
      <FaqPageHero />
      <FAQ
        categories={siteFaqCategories}
        faqData={siteFaqData}
        className="faq-page__inner"
        aria-label={siteFaqTitle}
      />
    </main>
  );
}
