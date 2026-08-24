import { FAQ } from "@/components/ui/faq-tabs";
import {
  siteFaqCategories,
  siteFaqData,
  siteFaqSupportEmail,
  siteFaqSupportNote,
  siteFaqTitle,
} from "@/content/faq";

/** Optional embed of the same FAQ layout (e.g. legacy footer band). */
export function SiteFaq() {
  return (
    <div className="site-faq">
      <FAQ
        title={siteFaqTitle}
        categories={siteFaqCategories}
        faqData={siteFaqData}
        supportNote={siteFaqSupportNote}
        supportEmail={siteFaqSupportEmail}
        className="faq-page__inner"
        aria-label={siteFaqTitle}
      />
    </div>
  );
}
