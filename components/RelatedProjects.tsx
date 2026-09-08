"use client";

import { useEffect, useMemo, useState } from "react";
import { FrostIndexLink } from "@/components/FrostIndexLink";
import { ProjectMasonry } from "@/components/ProjectMasonry";
import type { Project } from "@/content/projects";
import {
  reconcileRotation,
  selectRelated,
  type RotationState,
} from "@/lib/related-project-rotation";

const STORAGE_KEY = "iamedx:related-projects:v3";

let memory: RotationState | undefined;
let storageUnavailable = false;

function readState(): RotationState | undefined {
  if (storageUnavailable) return memory;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return memory;
    return reconcileRotation(JSON.parse(raw));
  } catch {
    storageUnavailable = true;
    return memory;
  }
}

function saveState(state: RotationState) {
  memory = state;
  if (storageUnavailable) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    storageUnavailable = true;
  }
}

type RelatedProjectsProps = {
  currentSlug: string;
  /** Same involvement-tag peers only (current project already excluded) */
  peers: Project[];
  /** Involvement tag label used as the rotation bucket key */
  tagKey: string;
};

/**
 * Project-detail Related strip — rotates within the same type-tag pool
 * via a per-tag queue in localStorage (avoids the same 2–3 looping).
 */
export function RelatedProjects({
  currentSlug,
  peers,
  tagKey,
}: RelatedProjectsProps) {
  const peerSlugs = useMemo(() => peers.map((p) => p.slug), [peers]);
  const [ids, setIds] = useState<string[] | null>(null);

  useEffect(() => {
    const selection = selectRelated({
      tagKey,
      currentSlug,
      peerSlugs,
      limit: 2,
      raw: readState(),
    });
    saveState(selection.state);
    setIds(selection.ids);
  }, [currentSlug, peerSlugs, tagKey]);

  const related = useMemo(() => {
    if (!ids) return [];
    const bySlug = new Map(peers.map((p) => [p.slug, p]));
    const uniqueIds = [...new Set(ids)];
    return uniqueIds.flatMap((id) => {
      const project = bySlug.get(id);
      return project ? [project] : [];
    });
  }, [ids, peers]);

  const hasPeers = peers.length > 0;

  return (
    <section
      className={`section${hasPeers ? " projects-related" : ""} project-detail__related`}
    >
      {hasPeers ? (
        <h2 className="projects-related__title">Related</h2>
      ) : null}
      {related.length > 0 ? (
        <ProjectMasonry
          projects={related}
          layout="related"
          enableHoverSwap
        />
      ) : null}
      {hasPeers && ids === null ? (
        <div
          aria-hidden="true"
          style={{ minHeight: "min(50vw, 480px)" }}
        />
      ) : null}
      <FrostIndexLink href="/projects">All projects</FrostIndexLink>
    </section>
  );
}
