import { PageIndexTitle } from "@/components/PageIndexTitle";

const HERO_DESC =
  "An experienced specialist who excels at leveraging physical mediums to connect IP value with fans through radical collaboration";

/**
 * About index hero — same pin + desc recipe as Services.
 * Eyebrow + delayed hard-cut title; description hangs below title.
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
