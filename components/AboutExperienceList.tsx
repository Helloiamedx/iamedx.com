"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { experienceRoles } from "@/content/experience";
import { cn } from "@/lib/utils";

const WORK_META_DESKTOP_MQ = "(min-width: 901px)";

function syncWorkMetaColumnWidths(list: HTMLElement) {
  const desktop = window.matchMedia(WORK_META_DESKTOP_MQ).matches;
  if (!desktop) {
    list.style.removeProperty("--work-company-col-w");
    list.style.removeProperty("--work-country-col-w");
    list.style.removeProperty("--work-period-col-w");
    return;
  }

  const measure = (selector: string) => {
    let max = 0;
    list.querySelectorAll<HTMLElement>(selector).forEach((el) => {
      max = Math.max(max, Math.ceil(el.scrollWidth));
    });
    return max;
  };

  const companyW = measure(".about-boua__work-company-name");
  const countryW = measure(".about-boua__work-country");
  const periodW = measure(".about-boua__work-period");

  if (companyW > 0) {
    list.style.setProperty("--work-company-col-w", `${companyW}px`);
  }
  if (countryW > 0) {
    list.style.setProperty("--work-country-col-w", `${countryW}px`);
  }
  if (periodW > 0) {
    list.style.setProperty("--work-period-col-w", `${periodW}px`);
  }
}

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

function toggleExperienceItem(current: string, id: string) {
  return current === id ? "" : id;
}

/**
 * Experience career strip — hover a row to reveal bullets on pointer devices;
 * tap to toggle on touch.
 */
export function AboutExperienceList() {
  const [value, setValue] = useState("");
  const [hoverExpand, setHoverExpand] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sync = () => setHoverExpand(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const run = () => syncWorkMetaColumnWidths(list);

    run();
    const desktopMq = window.matchMedia(WORK_META_DESKTOP_MQ);
    desktopMq.addEventListener("change", run);
    window.addEventListener("resize", run);
    document.fonts?.ready.then(run);

    return () => {
      desktopMq.removeEventListener("change", run);
      window.removeEventListener("resize", run);
    };
  }, []);

  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      value={value}
      onValueChange={setValue}
      className="about-boua__work-list"
      ref={listRef}
    >
      {experienceRoles.map((role, index) => (
        <AccordionPrimitive.Item
          key={role.id}
          value={role.id}
          className="about-boua__work-item"
          onMouseEnter={() => hoverExpand && setValue(role.id)}
          onMouseLeave={() => hoverExpand && setValue("")}
        >
          <AccordionPrimitive.Header className="about-boua__work-row-header">
            <div
              role="button"
              tabIndex={0}
              className={cn(
                "about-boua__work-row",
                "about-boua__work-row--trigger",
                hoverExpand && "about-boua__work-row--hover",
              )}
              onClick={() => {
                if (!hoverExpand) {
                  setValue((current) => toggleExperienceItem(current, role.id));
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setValue((current) => toggleExperienceItem(current, role.id));
                }
              }}
            >
              <span className="about-boua__work-index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="about-boua__work-title">{role.role}</span>
              <div className="about-boua__work-meta">
                <span className="about-boua__work-company">
                  <span className="about-boua__work-company-name">
                    {role.company}
                  </span>
                </span>
                <span className="about-boua__work-country">{role.country}</span>
                <span className="about-boua__work-period">{role.period}</span>
              </div>
            </div>
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
