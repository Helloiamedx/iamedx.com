import { LineRevealText } from "@/components/LineRevealText";
import { myApproach } from "@/content/homeCopy";

const POINTS = myApproach.points;

/**
 * My Approach — title left, 2×3 copy grid right, gray plate.
 * Mobile: title sticks while the long right column scrolls.
 */
export function HomeMyApproach() {
  return (
    <section
      className="home-someone"
      id={myApproach.id}
      aria-labelledby={`${myApproach.id}-title`}
    >
      <div className="home-someone__inner">
        <div className="home-someone__rail">
          <h2 id={`${myApproach.id}-title`} className="home-someone__title">
            <LineRevealText text={myApproach.title} />
          </h2>
        </div>

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
