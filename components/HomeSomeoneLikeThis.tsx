import {
  someoneLikeThisLines,
  whyWorkWithMe,
} from "@/content/homeCopy";

const LINES = someoneLikeThisLines;

/**
 * Are You Looking… — copy parked here until layout is decided.
 * Photo plate layout now lives on My Approach.
 */
export function HomeSomeoneLikeThis() {
  return (
    <section
      className="home-someone-draft"
      id={whyWorkWithMe.id}
      aria-labelledby={`${whyWorkWithMe.id}-title`}
    >
      <div className="home-someone-draft__inner">
        <header className="home-someone-draft__intro">
          <h2 id={`${whyWorkWithMe.id}-title`}>{whyWorkWithMe.title}</h2>
          {whyWorkWithMe.subtitle ? <p>{whyWorkWithMe.subtitle}</p> : null}
        </header>

        <ul className="home-someone-draft__list">
          {LINES.map((item) => (
            <li key={item.title} className="home-someone-draft__item">
              <h3 className="home-someone-draft__item-title">{item.title}</h3>
              <p className="home-someone-draft__item-body">{item.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
