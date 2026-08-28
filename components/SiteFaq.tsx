import { FaqPageHero } from "@/components/FaqPageHero";
import { FAQ } from "@/components/ui/faq-tabs";
import {
  siteFaqCategories,
  siteFaqData,
  siteFaqTitle,
} from "@/content/faq";

/** Optional embed of the same FAQ layout (e.g. legacy footer band). */
export function SiteFaq() {
  return (
    <div className="site-faq">
      <FaqPageHero />
      <FAQ
        categories={siteFaqCategories}
        faqData={siteFaqData}
        className="faq-page__inner"
        aria-label={siteFaqTitle}
      />
    </div>
  );
}
