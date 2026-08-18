import Link from "next/link";
import { ClientLogoMarquee } from "@/components/ClientLogoMarquee";
import { HeroBackgroundVideo } from "@/components/HeroBackgroundVideo";
import { HeroHeadline } from "@/components/HeroHeadline";
import { HomeCopyBlock } from "@/components/HomeCopyBlock";
import { HomePricing } from "@/components/HomePricing";
import { InsightMasonry } from "@/components/InsightMasonry";
import { ProjectMasonry } from "@/components/ProjectMasonry";
import { SupportBento } from "@/components/SupportBento";
import { whatSetsMeApart, whyWorkWithMe } from "@/content/homeCopy";
import { projects } from "@/content/projects";
import { getAllInsights } from "@/lib/insights";
import { shuffleArray } from "@/lib/utils";

/** Fresh random picks on each request */
export const dynamic = "force-dynamic";

export default function HomePage() {
  const selectedProjects = shuffleArray(projects).slice(0, 3);
  const selectedInsights = shuffleArray(getAllInsights()).slice(0, 3);

  return (
    <main className="home-page">
      <section className="hero">
        <div className="hero__media" aria-hidden="true">
          <HeroBackgroundVideo />
        </div>
        <div className="hero__content">
          <HeroHeadline />
        </div>
        <ClientLogoMarquee />
      </section>

      <SupportBento />

      <HomeCopyBlock section={whatSetsMeApart} />
      <HomeCopyBlock section={whyWorkWithMe} />

      <HomePricing />

      <section className="section home-page__section">
        <div className="section__header">
          <h2>Selected projects</h2>
          <Link href="/projects">All projects</Link>
        </div>
        <ProjectMasonry projects={selectedProjects} />
      </section>

      <section className="section home-page__section">
        <div className="section__header">
          <h2>Selected thoughts</h2>
          <Link href="/thoughts">All thoughts</Link>
        </div>
        <InsightMasonry insights={selectedInsights} />
      </section>
    </main>
  );
}
