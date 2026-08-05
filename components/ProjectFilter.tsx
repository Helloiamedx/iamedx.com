"use client";

import Link from "next/link";
import { materials, type Material } from "@/content/projects";

type ProjectFilterProps = {
  active: Material | "all";
};

export function ProjectFilter({ active }: ProjectFilterProps) {
  return (
    <div className="project-filter" role="list">
      {materials.map((material) => {
        const href =
          material.id === "all"
            ? "/projects"
            : `/projects?material=${material.id}`;
        const isActive = active === material.id;

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
