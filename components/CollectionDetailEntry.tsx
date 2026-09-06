"use client";

import { HeroSegmentVideo } from "@/components/HeroSegmentVideo";
import { OriginButton } from "@/components/ui/origin-button";
import { YouTubeBackground } from "@/components/YouTubeBackground";
import {
  getCaseCopySections,
  type CaseCopySection,
} from "@/content/caseCopy";
import type { Project } from "@/content/projects";
import { asset } from "@/lib/assets";
import {
  VIDEO_LOAD_PRIORITY,
  unlockVideosAfterHero,
  useAfterHeroGate,
} from "@/lib/videoLoadQueue";

type CollectionDetailEntryProps = {
  /** Game / IP display name — between first project card and Read case study */
  gameTitle: string;
  /** Official site — left Visit official CTA when set */
  officialWebsite?: string;
  /** Studio / publisher name in left CTA */
  companyName?: string;
  /** Dedicated left-column IP video when set */
  ipVideo?: string;
  /** Lead project = left IP media fallback; all projects stack on the right */
  projects: Project[];
};

/** Collection detail right rail — Outcome only. */
function getCollectionOutcomeSections(project: Project): CaseCopySection[] {
  return getCaseCopySections(project).filter(
    (section) => section.id === "outcome",
  );
}

function CollectionIpHero({
  ipVideo,
  fallbackProject,
}: {
  ipVideo?: string;
  fallbackProject: Project;
}) {
  if (ipVideo) {
    return (
      <HeroSegmentVideo
        className="collection-detail__entry-video"
        src={ipVideo}
        priority={VIDEO_LOAD_PRIORITY.caseHero}
      />
    );
  }

  return (
    <CollectionEntryHero
      project={fallbackProject}
      priority={VIDEO_LOAD_PRIORITY.caseHero}
    />
  );
}

function CollectionEntryHero({
  project,
  priority = VIDEO_LOAD_PRIORITY.gallery,
}: {
  project: Project;
  priority?: number;
}) {
  if (project.heroVideo) {
    return (
      <HeroSegmentVideo
        className="collection-detail__entry-video"
        src={project.heroVideo}
        startSeconds={project.heroVideoStart ?? 0}
        endSeconds={project.heroVideoEnd}
        priority={priority}
      />
    );
  }

  if (project.heroYoutubeId) {
    return (
      <YouTubeBackground
        className="collection-detail__entry-video collection-detail__entry-video--embed"
        videoId={project.heroYoutubeId}
        startSeconds={project.heroYoutubeStart ?? 0}
        endSeconds={project.heroYoutubeEnd}
        isPageHero={priority <= VIDEO_LOAD_PRIORITY.caseHero}
      />
    );
  }

  if (project.heroImage) {
    return (
      <CollectionStill
        src={project.heroImage}
        unlockHero={priority <= VIDEO_LOAD_PRIORITY.caseHero}
      />
    );
  }

  return (
    <HeroSegmentVideo
      className="collection-detail__entry-video"
      src={asset("videos/home-hero-video.mp4")}
      priority={priority}
    />
  );
}

function CollectionStill({
  src,
  unlockHero,
}: {
  src: string;
  unlockHero: boolean;
}) {
  const afterHero = useAfterHeroGate();
  const canLoad = unlockHero || afterHero;

  if (!canLoad) {
    return <div className="collection-detail__entry-still" aria-hidden="true" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="collection-detail__entry-still"
      src={src}
      alt=""
      draggable={false}
      ref={(el) => {
        if (unlockHero && el?.complete) unlockVideosAfterHero();
      }}
      onLoad={() => {
        if (unlockHero) unlockVideosAfterHero();
      }}
    />
  );
}

function CollectionProjectBlock({
  project,
  gameTitle,
}: {
  project: Project;
  /** Between the project card and Read case study */
  gameTitle: string;
}) {
  const outcomeSections = getCollectionOutcomeSections(project);

  return (
    <div className="collection-detail__project">
      <div className="collection-detail__project-media-frame">
        <CollectionEntryHero
          project={project}
          priority={VIDEO_LOAD_PRIORITY.gallery}
        />
      </div>
      <h2 className="collection-detail__entry-ip">{gameTitle}</h2>
      <OriginButton href={`/projects/${project.slug}`}>
        Read case study
      </OriginButton>
      {outcomeSections.length > 0 ? (
        <div className="collection-detail__entry-body project-case-demo__panel-copy">
          {outcomeSections.map((section) => (
            <section
              key={section.id}
              className="project-case-demo__panel-block collection-detail__entry-section"
            >
              <h3 className="collection-detail__entry-section-title">
                {section.id === "outcome" ? "OUTCOME" : section.label}
              </h3>
              {section.body.map((paragraph) => {
                const trimmed = paragraph.trim();
                if (!trimmed) return null;
                return (
                  <p key={`${section.id}-${trimmed.slice(0, 48)}`}>
                    {trimmed}
                  </p>
                );
              })}
            </section>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function CollectionDetailEntry({
  gameTitle,
  officialWebsite,
  companyName,
  ipVideo,
  projects,
}: CollectionDetailEntryProps) {
  const leadProject = projects[0];
  if (!leadProject) return null;

  return (
    <article className="collection-detail__entry">
      <hr className="collection-detail__rule" aria-hidden="true" />
      <div className="collection-detail__entry-stage">
        <div className="collection-detail__entry-grid">
          <div className="collection-detail__entry-media">
            <div className="collection-detail__entry-media-frame">
              <CollectionIpHero
                ipVideo={ipVideo}
                fallbackProject={leadProject}
              />
            </div>
            {companyName ? (
              <p className="collection-detail__entry-ip">{companyName}</p>
            ) : null}
            <OriginButton
              href={officialWebsite || "#"}
              external={Boolean(officialWebsite)}
              onClick={
                officialWebsite
                  ? undefined
                  : (event) => {
                      event.preventDefault();
                    }
              }
            >
              Visit official
            </OriginButton>
          </div>

          <div className="collection-detail__entry-copy">
            <div className="collection-detail__projects">
              {projects.map((project) => (
                <CollectionProjectBlock
                  key={project.slug}
                  project={project}
                  gameTitle={gameTitle}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
