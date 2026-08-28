import { PageIndexTitle } from "@/components/PageIndexTitle";

/**
 * Projects index hero — WORK eyebrow + title.
 * Same classes / spacing as Services + Thoughts (`.svc-demo__hero-*`).
 */
export function ProjectsPageIntro() {
  return (
    <section
      className="projects-index-intro page-index-intro"
      aria-label="Projects introduction"
    >
      <div className="projects-index-intro__inner page-index-intro__inner">
        <p className="svc-demo__hero-eyebrow">Work</p>
        <PageIndexTitle>Explore Achievement Moments</PageIndexTitle>
      </div>
    </section>
  );
}
