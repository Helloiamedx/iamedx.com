import { ClientLogoMarquee } from "@/components/ClientLogoMarquee";
import { homeRecognition } from "@/content/homeCopy";

/**
 * Home recognition band — logo rail, large headline (+ optional portrait),
 * supporting body, then a metrics row. Static; data in `homeRecognition`.
 */
export function HomeRecognitionBand() {
  const { id, headlineBefore, headlineAfter, body, portrait, metrics } =
    homeRecognition;

  return (
    <section
      className="home-recognition"
      id={id}
      aria-labelledby={`${id}-title`}
    >
      <ClientLogoMarquee />

      <div className="home-recognition__shell">
        <div className="home-recognition__top">
          <h2 id={`${id}-title`} className="home-recognition__headline">
            {headlineBefore}
            {portrait ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portrait}
                alt=""
                className="home-recognition__portrait"
              />
            ) : null}{" "}
            {headlineAfter}
          </h2>
          <p className="home-recognition__body">{body}</p>
        </div>

        <ul className="home-recognition__metrics">
          {metrics.map((metric) => (
            <li key={metric.id} className="home-recognition__metric">
              <p className="home-recognition__value">{metric.value}</p>
              <p className="home-recognition__label">{metric.label}</p>
              <p className="home-recognition__blurb">{metric.blurb}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
