import { PageIndexTitle } from "@/components/PageIndexTitle";
import {
  siteFaqEyebrow,
  siteFaqSupportEmail,
  siteFaqTitle,
} from "@/content/faq";

/**
 * FAQ index hero — shared page-index-intro stack (eyebrow + title + desc).
 */
export function FaqPageHero() {
  return (
    <section
      className="faq-index-intro page-index-intro"
      aria-label="Frequently asked questions"
    >
      <div className="page-index-intro__inner">
        <p className="svc-demo__hero-eyebrow">{siteFaqEyebrow}</p>
        <PageIndexTitle id="faq-hero-title">{siteFaqTitle}</PageIndexTitle>
        <p className="svc-demo__hero-desc">
          Can&apos;t find what you&apos;re looking for? Reach out at{" "}
          <a href={`mailto:${siteFaqSupportEmail}`}>{siteFaqSupportEmail}</a>
          {" "}
          — you&apos;ll get a reply within 18 hours.
        </p>
      </div>
    </section>
  );
}
