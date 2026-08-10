import { insightsHero } from "@/content/nav";

export function InsightsHero() {
  return (
    <header className="insights-opening__plate">
      <div className="insights-opening__plate-inner">
        <p className="insights-opening__eyebrow">{insightsHero.eyebrow}</p>
        <h1 id="insights-hero-title" className="insights-opening__headline">
          {insightsHero.headline}
        </h1>
      </div>
    </header>
  );
}
