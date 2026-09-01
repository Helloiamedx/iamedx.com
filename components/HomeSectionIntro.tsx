type HomeSectionIntroProps = {
  /** `id` for the h2 — section `aria-labelledby` target */
  titleId: string;
  /** Small mono label — use a placeholder like `Label` until real copy exists */
  label: string;
  title: string;
};

/**
 * Shared home section intro — label + title in one 55% container.
 * Type recipe is owned by Character (`.home-page` tokens); change once → all bands follow.
 */
export function HomeSectionIntro({
  titleId,
  label,
  title,
}: HomeSectionIntroProps) {
  return (
    <header className="home-section-intro">
      <p className="home-section-intro__label">{label}</p>
      <h2 id={titleId} className="home-section-intro__title">
        {title}
      </h2>
    </header>
  );
}
