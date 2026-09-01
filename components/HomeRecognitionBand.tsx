import { ClientLogoMarquee } from "@/components/ClientLogoMarquee";
import { HomeSectionIntro } from "@/components/HomeSectionIntro";
import { homeRecognition } from "@/content/homeCopy";

/**
 * Home recognition band — shared intro + 2×2 metrics + scrolling logos.
 */
export function HomeRecognitionBand() {
  const { id, eyebrow, headlineBefore, headlineAfter, metrics } =
    homeRecognition;
  const headline = `${headlineBefore} ${headlineAfter}`.trim();

  return (
    <section
      className="home-recognition"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <div className="home-recognition__shell">
        <HomeSectionIntro
          titleId={`${id}-title`}
          label={eyebrow}
          title={headline}
        />

        <ul className="home-recognition__metrics">
          {metrics.map((metric) => (
            <li key={metric.id} className="home-recognition__metric">
              <p className="home-recognition__value">{metric.value}</p>
              <p className="home-recognition__label">{metric.label}</p>
            </li>
          ))}
        </ul>

        <ClientLogoMarquee />
      </div>
    </section>
  );
}
