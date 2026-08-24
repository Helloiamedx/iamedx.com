import type { Metadata } from "next";
import { FAQ } from "@/components/ui/faq-tabs";
import {
  siteFaqCategories,
  siteFaqData,
  siteFaqSupportEmail,
  siteFaqSupportNote,
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
      <FAQ
        title={siteFaqTitle}
        categories={siteFaqCategories}
        faqData={siteFaqData}
        supportNote={siteFaqSupportNote}
        supportEmail={siteFaqSupportEmail}
        className="faq-page__inner"
        aria-label={siteFaqTitle}
      />
    </main>
  );
}
