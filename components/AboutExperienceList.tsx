"use client";

import type { ReactNode } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { experienceRoles } from "@/content/experience";
import { cn } from "@/lib/utils";

/** Renders `**phrase**` markers as white scan highlights. */
function renderBullet(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    const match = /^\*\*([^*]+)\*\*$/.exec(part);
    if (match) {
      return (
        <span key={i} className="about-boua__work-hl">
          {match[1]}
        </span>
      );
    }
    return part;
  });
}

/**
 * Experience career strip — same columns as before.
 * Click a row to reveal bullets (no +/- button, no Location line).
 */
export function AboutExperienceList() {
  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      className="about-boua__work-list"
    >
      {experienceRoles.map((role, index) => (
        <AccordionPrimitive.Item
          key={role.id}
          value={role.id}
          className="about-boua__work-item"
        >
          <AccordionPrimitive.Header className="about-boua__work-row-header">
            <AccordionPrimitive.Trigger
              className={cn(
                "about-boua__work-row",
                "about-boua__work-row--trigger",
              )}
            >
              <span className="about-boua__work-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="about-boua__work-title">{role.role}</span>
              <span className="about-boua__work-company">
                <span className="about-boua__work-company-name">
                  {role.company}
                </span>
              </span>
              <span className="about-boua__work-country">{role.country}</span>
              <span className="about-boua__work-period">{role.period}</span>
            </AccordionPrimitive.Trigger>
          </AccordionPrimitive.Header>

          <AccordionPrimitive.Content className="about-boua__work-detail">
            <ul className="about-boua__work-bullets">
              {role.bullets.map((bullet) => (
                <li key={bullet}>{renderBullet(bullet)}</li>
              ))}
            </ul>
          </AccordionPrimitive.Content>
        </AccordionPrimitive.Item>
      ))}
    </AccordionPrimitive.Root>
  );
}
