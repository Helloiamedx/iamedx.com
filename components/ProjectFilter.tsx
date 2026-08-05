"use client";

import Link from "next/link";
import { materials, type Material } from "@/content/projects";

type ProjectFilterProps = {
  active: Material | "all";
  activeIp?: string | null;
};

export function ProjectFilter({ active, activeIp }: ProjectFilterProps) {
  return (
    <div className="project-filter" role="list">
      {activeIp ? (
        <Link href="/projects" role="listitem" className="is-active">
          Clear IP filter
        </Link>
      ) : null}
      {materials.map((material) => {
        const href =
          material.id === "all"
            ? "/projects"
            : `/projects?material=${material.id}`;
        const isActive = !activeIp && active === material.id;

        return (
          <Link
            key={material.id}
            href={href}
            role="listitem"
            className={isActive ? "is-active" : undefined}
            aria-current={isActive ? "page" : undefined}
          >
            {material.label}
          </Link>
        );
      })}
    </div>
  );
}
