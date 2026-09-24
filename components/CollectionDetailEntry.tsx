"use client";

import { Fragment, useEffect } from "react";
import { HeadlineMotion } from "@/components/HeadlineMotion";
import { HeroSegmentVideo } from "@/components/HeroSegmentVideo";
import { OriginButton } from "@/components/ui/origin-button";
import { YouTubeBackground } from "@/components/YouTubeBackground";
import {
  getCaseCopySections,
  type CaseCopySection,
} from "@/content/caseCopy";
import type { CollectionIpProject } from "@/content/collections";
import type { Project } from "@/content/projects";
import { asset } from "@/lib/assets";
import {
  VIDEO_LOAD_PRIORITY,
  unlockVideosAfterHero,
  useAfterHeroGate,
} from "@/lib/videoLoadQueue";

type CollectionDetailEntryProps = {
  /** Official site — left Visit official CTA when set */
  officialWebsite?: string;
  /** Studio / publisher name in left CTA */
  companyName?: string;
  /** Dedicated left-column IP video when set */
  ipVideo?: string;
  /** Dedicated left-column IP still when set (and no ipVideo / ipLogo) */
  ipImage?: string;
  /** Studio logo on black plate when set (and no ipVideo) */
  ipLogo?: string;
  /** Lead project = left IP media fallback; all projects stack on the right */
  projects: CollectionIpProject[];
};

/** Collection detail right rail — Outcome only. */
function getCollectionOutcomeSections(project: Project): CaseCopySection[] {
  return getCaseCopySections(project).filter(
    (section) => section.id === "outcome",
  );
}

function CollectionIpHero({
  ipVideo,
  ipImage,
  ipLogo,
  companyName,
  fallbackProject,
}: {
  ipVideo?: string;
  ipImage?: string;
  ipLogo?: string;
  companyName?: string;
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

  if (ipLogo) {
    return <CollectionIpLogoPlate src={ipLogo} companyName={companyName} />;
  }

  if (ipImage) {
    return (
      <CollectionStill
        src={ipImage}
        unlockHero
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

function CollectionIpLogoPlate({
  src,
  companyName,
}: {
  src: string;
  companyName?: string;
}) {
  useEffect(() => {
    unlockVideosAfterHero();
  }, []);

  return (
    <div className="collection-detail__entry-logo">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="collection-detail__entry-logo-mark"
        src={src}
        alt={companyName ? `${companyName} logo` : ""}
        draggable={false}
        onLoad={() => unlockVideosAfterHero()}
      />
    </div>
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
}: {
  project: Project;
}) {
  const outcomeSections = getCollectionOutcomeSections(project);
  const hoverStills = project.coverHoverStills;
  const hasHoverStills = Boolean(hoverStills && hoverStills.length === 3);

  return (
    <div className="collection-detail__project">
      <div
        className={
          hasHoverStills
            ? "collection-detail__project-media-frame collection-detail__project-media-frame--swap"
            : "collection-detail__project-media-frame"
        }
      >
        <div className="collection-detail__project-media-cover">
          <CollectionEntryHero
            project={project}
            priority={VIDEO_LOAD_PRIORITY.gallery}
          />
        </div>
        {hasHoverStills ? (
          <div
            className="collection-detail__project-media-cycle"
            aria-hidden="true"
          >
            {hoverStills!.map((src, index) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={src}
                className={`collection-detail__project-swap-frame collection-detail__project-swap-frame--${index + 1}`}
                src={src}
                alt=""
                draggable={false}
                loading="lazy"
              />
            ))}
          </div>
        ) : null}
      </div>
      <h2 className="collection-detail__project-title">{project.title}</h2>
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
              <HeadlineMotion
                as="h3"
                effect="01"
                className="collection-detail__entry-section-title"
              >
                {section.id === "outcome" ? "OUTCOME" : section.label}
              </HeadlineMotion>
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
  officialWebsite,
  companyName,
  ipVideo,
  ipImage,
  ipLogo,
  projects,
}: CollectionDetailEntryProps) {
  const leadProject = projects[0]?.project;
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
                ipImage={ipImage}
                ipLogo={ipLogo}
                companyName={companyName}
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
              {projects.map(({ project }, index) => (
                <Fragment key={project.slug}>
                  {index > 0 ? (
                    <hr
                      className="collection-detail__project-rule"
                      aria-hidden="true"
                    />
                  ) : null}
                  <CollectionProjectBlock project={project} />
                </Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
