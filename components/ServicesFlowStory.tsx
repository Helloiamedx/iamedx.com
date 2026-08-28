"use client";

import Image from "next/image";
import { useState } from "react";
import { CoverLoopVideo } from "@/components/CoverLoopVideo";
import { PageIndexTitle } from "@/components/PageIndexTitle";
import { PanelImageStack } from "@/components/PanelImageStack";
import { ServiceWorkflowDialog } from "@/components/ServiceWorkflowDialog";
import { OriginButton } from "@/components/ui/origin-button";
import {
  servicePackagePhases,
  type ServicePackageItem,
  type ServicePackagePhase,
} from "@/content/servicePackages";
import { cn } from "@/lib/utils";

const HERO_EYEBROW = "My focus";
const HERO_TITLE = "My capabilities";
const HERO_DESC =
  "From initial idea to final delivery, I provide hands-on support throughout your product journey, helping you source suppliers, optimize designs, manage production, and ensure quality.";

/** Shared placeholder until per-phase media is supplied */
const PHASE_PLACEHOLDER_IMAGE =
  "https://cdn.prod.website-files.com/6849da698cb78e39e81215a8/68877d2e008df5cf9536b877_Orangetheorytest.avif";

/**
 * Services page — half-viewport hero pin matches Projects / Thoughts
 * (eyebrow + title only). Description sits in the lower half of that band.
 */
export function ServicesFlowStory() {
  return (
    <div className="svc-demo">
      <section
        className="svc-demo__hero page-index-intro"
        aria-label="Services introduction"
      >
        <div className="page-index-intro__inner">
          <p className="svc-demo__hero-eyebrow">{HERO_EYEBROW}</p>
          <PageIndexTitle>{HERO_TITLE}</PageIndexTitle>
          <p className="svc-demo__hero-desc">{HERO_DESC}</p>
        </div>
      </section>

      {servicePackagePhases.map((phase, index) => (
        <PhaseSection key={phase.id} phase={phase} index={index} />
      ))}
    </div>
  );
}

function phaseLabel(title: string) {
  return title.replace(/\s+Phase$/i, "").trim();
}

function PhaseSection({
  phase,
  index,
}: {
  phase: ServicePackagePhase;
  index: number;
}) {
  return (
    <section
      className={cn("svc-demo__stage", `svc-demo__stage--${index + 1}`)}
      aria-label={`${phase.code} ${phase.title}`}
    >
      <div className="svc-phase">
        <div className="svc-phase__rule" aria-hidden="true" />

        <div className="svc-phase__cols">
          <aside className="svc-phase__aside">
            <h2 className="svc-phase__label">{phaseLabel(phase.title)}</h2>
            <p className="svc-phase__aside-desc">{phase.description}</p>
          </aside>

          <div className="svc-phase__main">
            <div className="svc-phase__items">
              {phase.items.map((item) => (
                <ServiceItemBlock key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ServiceItemBlock({ item }: { item: ServicePackageItem }) {
  const [workflowOpen, setWorkflowOpen] = useState(false);

  return (
    <article className="svc-item" aria-label={item.title}>
      <div className="svc-item__intro">
        <h4 className="svc-item__title">{item.title}</h4>
        <p className="svc-item__desc">{item.description}</p>
      </div>
      <div className="svc-item__cta">
        <OriginButton type="button" onClick={() => setWorkflowOpen(true)}>
          View workflow
        </OriginButton>
      </div>

      <ServiceWorkflowDialog
        open={workflowOpen}
        onClose={() => setWorkflowOpen(false)}
        title={item.title}
      />

      <div className="svc-item__media">
        {item.coverVideo ? (
          <CoverLoopVideo
            src={item.coverVideo}
            className="svc-item__image"
            ariaLabel={item.title}
          />
        ) : item.coverImages?.length ? (
          <PanelImageStack
            images={item.coverImages}
            className="svc-item__image-stack"
          />
        ) : (
          <Image
            src={PHASE_PLACEHOLDER_IMAGE}
            alt=""
            width={1600}
            height={900}
            className="svc-item__image"
            sizes="(max-width: 900px) 100vw, 50vw"
          />
        )}
      </div>

      <div className="svc-phase__grid" aria-label={`${item.code} details`}>
        <div className="svc-phase__cell">
          <p className="svc-phase__cell-label">Assistance</p>
          <ul className="svc-phase__cell-list">
            {item.assistance.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </div>

        <div className="svc-phase__cell">
          <p className="svc-phase__cell-label">Deliverables</p>
          <ul className="svc-phase__cell-list">
            {item.deliverables.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </div>

        <div className="svc-phase__cell">
          <p className="svc-phase__cell-label">Timeline</p>
          <p className="svc-phase__cell-body">
            {item.timeline ?? "Based on project scope"}
          </p>
        </div>

        <div className="svc-phase__cell">
          <p className="svc-phase__cell-label">Fee</p>
          <p className="svc-phase__cell-body">{item.fee.label}</p>
        </div>
      </div>
    </article>
  );
}
