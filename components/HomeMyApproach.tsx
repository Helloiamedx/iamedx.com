"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CoverLoopVideo } from "@/components/CoverLoopVideo";
import { myApproach } from "@/content/homeCopy";
import { SnapCarousel } from "@/lib/snapCarousel";

const POINTS = myApproach.points;

function ApproachCaption({
  title,
  body,
  highlight,
}: {
  title: string;
  body: string;
  highlight?: string;
}) {
  let bodyNodes: ReactNode = body;
  if (highlight && body.includes(highlight)) {
    const start = body.indexOf(highlight);
    const end = start + highlight.length;
    bodyNodes = (
      <>
        {body.slice(0, start)}
        <span className="home-someone__caption-hl">{highlight}</span>
        {body.slice(end)}
      </>
    );
  }
  return (
    <p>
      <strong>{title}.</strong> {bodyNodes}
    </p>
  );
}

/**
 * My Approach — Apple-style snap gallery (ChatGPT carousel logic).
 * Site copy + placeholder media; dedicated approach assets later.
 */
export function HomeMyApproach() {
  const galleryRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<SnapCarousel | null>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  useEffect(() => {
    const root = galleryRef.current;
    const prev = prevRef.current;
    const next = nextRef.current;
    if (!root || !prev || !next) return;
    const scroller = root.querySelector<HTMLElement>("[data-scroller]");
    if (!scroller) return;
    const slides = [
      ...root.querySelectorAll<HTMLElement>("[data-slide]"),
    ];

    const carousel = new SnapCarousel({
      root,
      scroller,
      slides,
      prev,
      next,
      onIndexChange: (index, count) => {
        setCanPrev(count > 1 && index > 0);
        setCanNext(count > 1 && index < count - 1);
      },
    });
    carouselRef.current = carousel;

    /* Remeasure after layout / images so paddles aren’t stuck disabled. */
    const remeasure = () => {
      carousel.measure();
      carousel.sync();
    };
    const t1 = window.setTimeout(remeasure, 0);
    const t2 = window.setTimeout(remeasure, 300);
    const t3 = window.setTimeout(remeasure, 1000);
    window.addEventListener("load", remeasure);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener("load", remeasure);
      carousel.destroy();
      carouselRef.current = null;
    };
  }, []);

  return (
    <section
      className="home-someone"
      id={myApproach.id}
      aria-labelledby={`${myApproach.id}-title`}
    >
      <header className="home-someone__head">
        <h2 id={`${myApproach.id}-title`} className="home-someone__title">
          {myApproach.title}
        </h2>
      </header>

      <div
        ref={galleryRef}
        className="home-someone__gallery"
        aria-label="Approach cards"
        data-carousel
      >
        <div className="home-someone__scroller" tabIndex={0} data-scroller>
          <div className="home-someone__track-pad">
            <ul className="home-someone__track" role="list">
              {POINTS.map((item) => (
                <li key={item.id} className="home-someone__slide" data-slide>
                  <div className="home-someone__media">
                    {item.video ? (
                      <CoverLoopVideo
                        src={item.video}
                        className="home-someone__media-fill"
                      />
                    ) : item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        fill
                        sizes="(max-width: 734px) 100vw, (max-width: 1068px) 72vw, 696px"
                        className="home-someone__media-img"
                        draggable={false}
                        onLoad={() => {
                          carouselRef.current?.measure();
                          carouselRef.current?.sync();
                        }}
                      />
                    ) : (
                      <div
                        className="home-someone__media-placeholder"
                        aria-hidden
                      />
                    )}
                  </div>
                  <div className="home-someone__caption">
                    <ApproachCaption
                      title={item.title}
                      body={item.body}
                      highlight={item.bodyHighlight}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <nav className="home-someone__paddles" aria-label="Approach navigation">
          <button
            ref={prevRef}
            className="home-someone__paddle"
            type="button"
            aria-label="Previous approach card"
            data-prev
            disabled={!canPrev}
            onClick={() => {
              const c = carouselRef.current;
              if (!c) return;
              c.go(c.index - 1);
            }}
          >
            <svg viewBox="0 0 36 36" aria-hidden>
              <path
                d="M20.25 13.5 15.75 18l4.5 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            </svg>
          </button>
          <button
            ref={nextRef}
            className="home-someone__paddle"
            type="button"
            aria-label="Next approach card"
            data-next
            disabled={!canNext}
            onClick={() => {
              const c = carouselRef.current;
              if (!c) return;
              c.go(c.index + 1);
            }}
          >
            <svg viewBox="0 0 36 36" aria-hidden>
              <path
                d="M15.75 13.5 20.25 18l-4.5 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />
            </svg>
          </button>
        </nav>
      </div>
    </section>
  );
}
