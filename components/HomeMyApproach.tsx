import { myApproach } from "@/content/homeCopy";
import { supportBentoSection } from "@/content/supportBento";

const POINTS = myApproach.points;

/**
 * My Approach — blurred photo plate, large left title, points on the right.
 * Same shell as the former Someone Like This band.
 */
export function HomeMyApproach() {
  return (
    <section
      className="home-someone"
      id={myApproach.id}
      aria-labelledby={`${myApproach.id}-title`}
    >
      <div
        className="home-someone__bg"
        aria-hidden="true"
        style={{
          backgroundImage: `url("${supportBentoSection.backgroundImage}")`,
        }}
      />
      <div className="home-someone__frost" aria-hidden="true" />

      <div className="home-someone__inner">
        <div className="home-someone__lead">
          <h2
            id={`${myApproach.id}-title`}
            className="home-someone__title"
          >
            <span className="home-someone__title-em">{myApproach.titleEm}</span>{" "}
            Approach
          </h2>
          {myApproach.subtitle ? (
            <p className="home-someone__subtitle">{myApproach.subtitle}</p>
          ) : null}
        </div>

        <ul className="home-someone__grid">
          {POINTS.map((item) => (
            <li key={item.id} className="home-someone__item">
              <h3 className="home-someone__item-title">{item.title}</h3>
              {item.body ? (
                <p className="home-someone__item-body">{item.body}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
