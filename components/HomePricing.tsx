import Link from "next/link";
import {
  homePricingSection,
  homePricingStages,
} from "@/content/homePricing";

export function HomePricing() {
  const { id, title, subtitle, ctaLabel, ctaHref, moreLabel, moreHref } =
    homePricingSection;

  return (
    <section className="home-pricing" id={id} aria-labelledby="home-pricing-title">
      <div className="home-pricing__intro">
        <div className="home-pricing__heading">
          <h2 id="home-pricing-title" className="home-pricing__title">
            {title}
          </h2>
          <Link href={moreHref} className="home-pricing__more">
            {moreLabel}
          </Link>
        </div>
        <p className="home-pricing__subtitle">{subtitle}</p>
      </div>

      <ul className="home-pricing__grid">
        {homePricingStages.map((stage) => (
          <li key={stage.id} className="home-pricing__card">
            <h3 className="home-pricing__card-title">{stage.title}</h3>
            <p className="home-pricing__card-body">{stage.summary}</p>
          </li>
        ))}
      </ul>

      <div className="home-pricing__footer">
        <a href={ctaHref} className="home-pricing__cta">
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
