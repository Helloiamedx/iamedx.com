import { FrostIndexLink } from "@/components/FrostIndexLink";
import {
  HeroBackgroundVideo,
} from "@/components/HeroBackgroundVideo";
import { HeroHeadline } from "@/components/HeroHeadline";
import { HomeDifferentCards } from "@/components/HomeDifferentCards";
import { HomeMyApproach } from "@/components/HomeMyApproach";
import { HomeRecognitionBand } from "@/components/HomeRecognitionBand";
import { HomeSectionIntro } from "@/components/HomeSectionIntro";
import { InsightMasonry } from "@/components/InsightMasonry";
import { InsightsLead } from "@/components/InsightsLead";
import { ProjectFeaturedLead } from "@/components/ProjectFeaturedLead";
import { ProjectMasonry } from "@/components/ProjectMasonry";
import { SiteIntroLoader } from "@/components/SiteIntroLoader";
import { SupportBento } from "@/components/SupportBento";
import {
  getProjectBySlug,
  projectSlugFromName,
  projects,
  projectsFeaturedLead,
  type Project,
} from "@/content/projects";
import { HERO_VIDEO_SRC } from "@/lib/heroMedia";
import { getAllInsights, getInsightsFeaturedLead } from "@/lib/insights";
import { shuffleArray } from "@/lib/utils";

/** Fresh random picks on each request */
export const dynamic = "force-dynamic";

/** Home cards under featured lead — first slot fixed; second stays random */
const HOME_FIXED_PROJECT_CARD_SLUG = projectSlugFromName("The Witcher Banner");

function getHomeProjectCards(): Project[] {
  const fixed = getProjectBySlug(HOME_FIXED_PROJECT_CARD_SLUG);
  const random = shuffleArray(
    projects.filter(
      (project) =>
        project.slug !== projectsFeaturedLead.slug &&
        project.slug !== HOME_FIXED_PROJECT_CARD_SLUG,
    ),
  )[0];
  return [fixed, random].filter((project): project is Project => Boolean(project));
}

export default function HomePage() {
  const featuredInsight = getInsightsFeaturedLead();
  const selectedProjects = getHomeProjectCards();
  const selectedInsights = shuffleArray(
    getAllInsights().filter((insight) => insight.slug !== featuredInsight?.slug),
  ).slice(0, 2);

  return (
    <>
      {/* Intro gates on home hero playable (+ fonts) — not below-fold clips */}
      <SiteIntroLoader />
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

        {/* recognition → support → character → my approach → … */}
        <HomeRecognitionBand />
        <SupportBento />
        <HomeDifferentCards />
        <HomeMyApproach />

        <section
          className="section home-page__section"
          aria-labelledby="home-products-title"
        >
          <HomeSectionIntro
            titleId="home-products-title"
            label="portfolio"
            title="Products I have helped bring to life"
          />
          <ProjectFeaturedLead project={projectsFeaturedLead} />
          <ProjectMasonry
            projects={selectedProjects}
            layout="related"
            enableHoverSwap
          />
          <FrostIndexLink href="/projects">All projects</FrostIndexLink>
        </section>

        <section
          className="section home-page__section"
          aria-labelledby="home-thoughts-title"
        >
          <HomeSectionIntro
            titleId="home-thoughts-title"
            label="thoughts"
            title="How I think about my work"
          />
          {featuredInsight ? <InsightsLead insight={featuredInsight} /> : null}
          <InsightMasonry insights={selectedInsights} layout="related" />
          <FrostIndexLink href="/thoughts">All thoughts</FrostIndexLink>
        </section>
      </main>
    </>
  );
}
