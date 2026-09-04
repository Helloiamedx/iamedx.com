"use client";

import { HeroSegmentVideo } from "@/components/HeroSegmentVideo";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { OriginButton } from "@/components/ui/origin-button";
import { YouTubeBackground } from "@/components/YouTubeBackground";
import {
  getCaseCopySections,
  type CaseCopySection,
} from "@/content/caseCopy";
import type { Project } from "@/content/projects";
import { asset } from "@/lib/assets";

type CollectionDetailEntryProps = {
  project: Project;
  /** Game / IP display name — desktop: top of right column; mobile: above the card */
  gameTitle: string;
};

/** Collection detail right rail — Background then Outcome only. */
function getCollectionCopySections(project: Project): CaseCopySection[] {
  return getCaseCopySections(project).filter(
    (section) => section.id === "background" || section.id === "outcome",
  );
}

function CollectionEntryHero({ project }: { project: Project }) {
  if (project.heroVideo) {
    return (
      <HeroSegmentVideo
        className="collection-detail__entry-video"
        src={project.heroVideo}
        startSeconds={project.heroVideoStart ?? 0}
        endSeconds={project.heroVideoEnd}
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
      />
    );
  }

  if (project.heroImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="collection-detail__entry-still"
        src={project.heroImage}
        alt=""
        draggable={false}
      />
    );
  }

  return (
    <ProtectedVideo
      className="collection-detail__entry-video"
      src={asset("videos/home-hero-video.mp4")}
      preload="metadata"
    />
  );
}

export function CollectionDetailEntry({
  project,
  gameTitle,
}: CollectionDetailEntryProps) {
  const copySections = getCollectionCopySections(project);

  return (
    <article className="collection-detail__entry">
      <hr className="collection-detail__rule" aria-hidden="true" />
      <div className="collection-detail__entry-stage">
        <div className="collection-detail__entry-grid">
          <div className="collection-detail__entry-media">
            <div className="collection-detail__entry-media-frame">
              <CollectionEntryHero project={project} />
            </div>
            <OriginButton href={`/projects/${project.slug}`}>
              Read case study
            </OriginButton>
          </div>

          <div className="collection-detail__entry-copy">
            <h2 className="collection-detail__entry-ip">{gameTitle}</h2>
            {copySections.length > 0 ? (
              <div className="collection-detail__entry-body project-case-demo__panel-copy">
                {copySections.map((section) => (
                  <section
                    key={section.id}
                    className="project-case-demo__panel-block collection-detail__entry-section"
                  >
                    <h3 className="collection-detail__entry-section-title">
                      {section.label}
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
        </div>
      </div>
    </article>
  );
}
