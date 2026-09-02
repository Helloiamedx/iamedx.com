import { HomeSectionIntro } from "@/components/HomeSectionIntro";
import { myApproach } from "@/content/homeCopy";

const POINTS = myApproach.points;

/**
 * My Approach — intro on top, points grid below (3 per row).
 */
export function HomeMyApproach() {
  return (
    <section
      className="home-someone"
      id={myApproach.id}
      aria-labelledby={`${myApproach.id}-title`}
    >
      <div className="home-someone__inner">
        <HomeSectionIntro
          titleId={`${myApproach.id}-title`}
          label={myApproach.eyebrow}
          title={myApproach.title}
        />

        <ul className="home-someone__grid">
          {POINTS.map((item) => (
            <li key={item.id} className="home-someone__item">
              <h3 className="home-someone__item-title">{item.title}</h3>
              <p className="home-someone__item-body">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
