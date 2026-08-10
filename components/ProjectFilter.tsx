"use client";

import Link from "next/link";
import {
  involvementFilters,
  type Involvement,
} from "@/content/projects";

type ProjectFilterProps = {
  active: Involvement | "all";
  activeIp?: string | null;
};

export function ProjectFilter({ active, activeIp }: ProjectFilterProps) {
  return (
    <div className="project-involvement">
      <h2 className="project-involvement__heading">Explore Featured Projects</h2>

      {activeIp ? (
        <p className="project-involvement__ip">
          <Link href="/projects" scroll={false}>
            Clear IP filter
          </Link>
        </p>
      ) : null}

      <div className="project-involvement__folder">
        <div
          className="project-involvement__track"
          role="list"
          aria-label="Filter by involvement"
        >
          {involvementFilters.map((item) => {
            const href =
              item.id === "all"
                ? activeIp
                  ? `/projects?ip=${activeIp}`
                  : "/projects"
                : activeIp
                  ? `/projects?involvement=${item.id}&ip=${activeIp}`
                  : `/projects?involvement=${item.id}`;
            const isActive = active === item.id;

            return (
              <Link
                key={item.id}
                href={href}
                scroll={false}
                role="listitem"
                className={
                  isActive
                    ? "project-involvement__pill is-active"
                    : "project-involvement__pill"
                }
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
