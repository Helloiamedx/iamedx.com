import { PageIndexTitle } from "@/components/PageIndexTitle";
import { insightsHero } from "@/content/nav";

/**
 * Thoughts index hero — eyebrow + delayed title.
 * Same classes / spacing as Services + Projects (`.svc-demo__hero-*`).
 */
export function InsightsHero() {
  return (
    <header className="insights-opening__plate page-index-intro">
      <div className="insights-opening__plate-inner page-index-intro__inner">
        <p className="svc-demo__hero-eyebrow">{insightsHero.eyebrow}</p>
        <PageIndexTitle id="insights-hero-title">
          {insightsHero.headline}
        </PageIndexTitle>
      </div>
    </header>
  );
}
