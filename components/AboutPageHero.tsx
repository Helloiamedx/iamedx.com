import { PageIndexTitle } from "@/components/PageIndexTitle";

const HERO_DESC =
  "An experienced specialist who excels at leveraging physical mediums to connect IP value with fans through radical collaboration";

/**
 * About index hero — same recipe as Services:
 * eyebrow + title + in-flow description, shared index intro rhythm.
 */
export function AboutPageHero() {
  return (
    <section
      className="about-index-intro page-index-intro"
      aria-label="About Edward Xu"
    >
      <div className="page-index-intro__inner">
        <p className="svc-demo__hero-eyebrow">About</p>
        <PageIndexTitle>Hey, I Am Edward Xu</PageIndexTitle>
        <p className="svc-demo__hero-desc">{HERO_DESC}</p>
      </div>
    </section>
  );
}
