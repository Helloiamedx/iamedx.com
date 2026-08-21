import type { HomeCopySection } from "@/content/homeCopy";

type HomeCopyBlockProps = {
  section: HomeCopySection;
};

/**
 * Home editorial block — title always shown; points render when filled.
 */
export function HomeCopyBlock({ section }: HomeCopyBlockProps) {
  const hasSubtitle = section.subtitle.trim().length > 0;
  const hasPoints = section.points.length > 0;

  return (
    <section
      className="home-copy"
      id={section.id}
      aria-labelledby={`${section.id}-title`}
    >
      <div className="home-page__intro">
        <h2 id={`${section.id}-title`}>{section.title}</h2>
        {hasSubtitle ? <p>{section.subtitle}</p> : null}
      </div>

      {hasPoints ? (
        <ul className="home-copy__points">
          {section.points.map((point) => (
            <li key={point.id} className="home-copy__point">
              <h3 className="home-copy__point-title">{point.title}</h3>
              {point.body.trim() ? (
                <p className="home-copy__point-body">{point.body}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : hasSubtitle ? null : (
        <p className="home-copy__placeholder" aria-hidden="true">
          —
        </p>
      )}
    </section>
  );
}
