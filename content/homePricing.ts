import { contactCta } from "@/content/nav";
import { services } from "@/content/services";

export type HomePricingStage = {
  id: string;
  title: string;
  summary: string;
};

export const homePricingSection = {
  id: "pricing",
  title: "Pricing",
  subtitle:
    "Scope the stages you need — then get a clear quote for a tailored China supply chain.",
  ctaLabel: "Get a quote",
  ctaHref: contactCta.href,
  moreLabel: "Full pricing",
  moreHref: "/pricing",
} as const;

/** Home pricing preview — stage list without inventing dollar amounts */
export const homePricingStages: HomePricingStage[] = services
  .slice()
  .sort((a, b) => a.order - b.order)
  .map((service) => ({
    id: service.id,
    title: service.title,
    summary: service.summary,
  }));
