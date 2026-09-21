import { HeadlineMotion } from "@/components/HeadlineMotion";

type HomeSectionIntroProps = {
  /** `id` for the h2 — section `aria-labelledby` target */
  titleId: string;
  /** Small mono label — use a placeholder like `Label` until real copy exists */
  label: string;
  title: string;
};

/**
 * Shared home section intro — label + title in one 55% container.
 * Title entrance: effect 01 (轻移渐显) via the site headline-motion module.
 */
export function HomeSectionIntro({
  titleId,
  label,
  title,
}: HomeSectionIntroProps) {
  return (
    <header className="home-section-intro">
      <p className="home-section-intro__label">{label}</p>
      <HeadlineMotion
        as="h2"
        effect="01"
        id={titleId}
        className="home-section-intro__title"
      >
        {title}
      </HeadlineMotion>
    </header>
  );
}
