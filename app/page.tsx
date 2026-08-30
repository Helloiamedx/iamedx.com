import { FrostIndexLink } from "@/components/FrostIndexLink";
import {
  HeroBackgroundVideo,
} from "@/components/HeroBackgroundVideo";
import { HeroHeadline } from "@/components/HeroHeadline";
import { HomeDifferentCards } from "@/components/HomeDifferentCards";
import { HomeMyApproach } from "@/components/HomeMyApproach";
import { HomeRecognitionBand } from "@/components/HomeRecognitionBand";
import { HomeSomeoneLikeThis } from "@/components/HomeSomeoneLikeThis";
import { InsightMasonry } from "@/components/InsightMasonry";
import { InsightsLead } from "@/components/InsightsLead";
import { ProjectFeaturedLead } from "@/components/ProjectFeaturedLead";
import { ProjectMasonry } from "@/components/ProjectMasonry";
import { SupportBento } from "@/components/SupportBento";
import { projects, projectsFeaturedLead } from "@/content/projects";
import { HERO_VIDEO_SRC } from "@/lib/heroMedia";
import { getAllInsights, getInsightsFeaturedLead } from "@/lib/insights";
import { shuffleArray } from "@/lib/utils";

/** Fresh random picks on each request */
export const dynamic = "force-dynamic";

export default function HomePage() {
  const featuredInsight = getInsightsFeaturedLead();
  const selectedProjects = shuffleArray(
    projects.filter((project) => project.slug !== projectsFeaturedLead.slug),
  ).slice(0, 2);
  const selectedInsights = shuffleArray(
    getAllInsights().filter((insight) => insight.slug !== featuredInsight?.slug),
  ).slice(0, 2);

  return (
    <main className="home-page">
      {/* Kick hero bytes as early as the document head allows */}
      <link
        rel="preload"
        as="video"
        href={HERO_VIDEO_SRC}
        type="video/mp4"
        fetchPriority="high"
      />
      <section className="hero">
        <div className="hero__media" aria-hidden="true">
          <HeroBackgroundVideo />
        </div>
        <div className="hero__content">
          <HeroHeadline />
        </div>
      </section>

      {/* recognition → someone (draft) → my approach → character → support → … */}
      <HomeRecognitionBand />
      <HomeSomeoneLikeThis />
      <HomeMyApproach />
      <HomeDifferentCards />
      <SupportBento />

      <section className="section home-page__section">
        <div className="home-page__intro">
          <h2>Products I Have Helped Bring to Life</h2>
          <p>
            A selection of products I have helped develop from early concepts to
            final production, working closely with brands, designers, and
            manufacturers to solve challenges and bring ideas into reality.
          </p>
        </div>
        <ProjectFeaturedLead project={projectsFeaturedLead} />
        <ProjectMasonry
          projects={selectedProjects}
          layout="related"
          enableHoverSwap
        />
        <FrostIndexLink href="/projects">All projects</FrostIndexLink>
      </section>

      <section className="section home-page__section">
        <div className="home-page__intro">
          <h2>How I Think About My Work</h2>
          <p>
            Sharing my experience and perspective from years of working with
            brands, designers, and manufacturers to turn ideas into
            well-developed, manufacturable products.
          </p>
        </div>
        {featuredInsight ? <InsightsLead insight={featuredInsight} /> : null}
        <InsightMasonry insights={selectedInsights} layout="related" />
        <FrostIndexLink href="/thoughts">All thoughts</FrostIndexLink>
      </section>
    </main>
  );
}
