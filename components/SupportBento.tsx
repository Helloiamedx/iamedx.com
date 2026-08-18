import {
  supportBentoCards,
  supportBentoSection,
} from "@/content/supportBento";

export function SupportBento() {
  return (
    <section className="support-bento" aria-labelledby="support-bento-title">
      <div className="support-bento__intro">
        <h2 id="support-bento-title" className="support-bento__title">
          {supportBentoSection.title}
        </h2>
        <p className="support-bento__subtitle">{supportBentoSection.subtitle}</p>
      </div>

      <ul className="support-bento__grid">
        {supportBentoCards.map((card) => (
          <li
            key={card.id}
            className={`support-bento__card support-bento__card--${card.size} support-bento__card--${card.visual}`}
          >
            <div
              className="support-bento__visual"
              aria-hidden="true"
              data-visual={card.visual}
            />
            <div className="support-bento__copy">
              <h3 className="support-bento__card-title">{card.title}</h3>
              {card.description ? (
                <p className="support-bento__desc">{card.description}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
