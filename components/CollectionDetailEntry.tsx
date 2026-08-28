"use client";

import type { CSSProperties } from "react";
import { CoverLoopVideo } from "@/components/CoverLoopVideo";
import { OriginButton } from "@/components/ui/origin-button";
import type { CollectionTestimonial } from "@/content/collections";
import type { Project } from "@/content/projects";

type CollectionDetailEntryProps = {
  project: Project;
  gameTitle: string;
  gameInfo: string[];
  testimonial: CollectionTestimonial;
};

export function CollectionDetailEntry({
  project,
  gameTitle,
  gameInfo,
  testimonial,
}: CollectionDetailEntryProps) {
  return (
    <article className="collection-detail__entry">
      <div className="collection-detail__entry-grid">
        <div className="collection-detail__entry-media">
          <div
            className="collection-detail__entry-media-frame"
            style={
              {
                "--entry-cover-w": project.coverWidth,
                "--entry-cover-h": project.coverHeight,
              } as CSSProperties
            }
          >
            {project.coverVideo ? (
              <CoverLoopVideo
                className="collection-detail__entry-video"
                src={project.coverVideo}
                ariaLabel={project.title}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="collection-detail__entry-still"
                src={project.coverImage}
                alt={project.title}
                draggable={false}
              />
            )}
          </div>
          <OriginButton href={`/projects/${project.slug}`}>Read Case</OriginButton>
        </div>

        <div className="collection-detail__entry-copy">
          <h2 className="project-case-demo__panel-title">{gameTitle}</h2>
          {gameInfo.length > 0 ? (
            <div className="collection-detail__entry-body project-case-demo__panel-copy">
              {gameInfo.map((paragraph) => (
                <p key={paragraph.slice(0, 48)} className="collection-detail__entry-game">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : null}

          {testimonial.quote ? (
            <blockquote className="collection-detail__quote">
              <p>&ldquo;{testimonial.quote}&rdquo;</p>
              <footer className="collection-detail__quote-by">
                <span className="collection-detail__quote-name">
                  {testimonial.name}
                </span>
                <span className="collection-detail__quote-role">
                  {testimonial.role}
                </span>
              </footer>
            </blockquote>
          ) : null}
        </div>
      </div>
    </article>
  );
}
