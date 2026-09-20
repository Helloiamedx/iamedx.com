"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CoverLoopVideo } from "@/components/CoverLoopVideo";
import { myApproach } from "@/content/homeCopy";
import { SnapCarousel } from "@/lib/snapCarousel";

const POINTS = myApproach.points;

/** Wheel delta modes → px (trackpads report pixels) */
const LINE_DELTA_PX = 16;
const PAGE_DELTA_PX = 100;
/** Fingers are done once the wheel stream has been quiet this long */
const WHEEL_SETTLE_MS = 200;

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

  /*
   * Trackpad: free continuous scroll, then ease onto the nearest card.
   *
   * Two things go wrong if we leave the gesture to the browser:
   *  1. the gesture carries a small `deltaY`, which the page claims — a
   *     horizontal swipe drifts the whole viewport up/down (Lenis does the same
   *     with the vertical component);
   *  2. CSS snap re-aligns mid-scroll, so the rail gets yanked while moving.
   *
   * So we own it: block the default, add `deltaX` to `scrollLeft` ourselves (no
   * step — distance and speed follow the trackpad), and suspend snap until the
   * stream goes quiet. Mobile keeps the native touch scroller untouched — its
   * axis locking and snap feel are already right.
   */
  useEffect(() => {
    const gallery = galleryRef.current;
    const scroller =
      gallery?.querySelector<HTMLElement>("[data-scroller]") ?? null;
    if (!scroller) return;

    let settleTimer = 0;

    const endGesture = () => {
      scroller.classList.remove("is-free-scroll");
      const carousel = carouselRef.current;
      if (!carousel) return;
      /* Sync from where the free scroll landed, then ease onto that card */
      carousel.sync();
      carousel.go(carousel.index);
    };

    const onWheel = (event: WheelEvent) => {
      /* Pinch-zoom arrives as a wheel + ctrlKey */
      if (event.ctrlKey) return;

      let dx = event.deltaX;
      let dy = event.deltaY;
      if (event.deltaMode === 1) {
        dx *= LINE_DELTA_PX;
        dy *= LINE_DELTA_PX;
      } else if (event.deltaMode === 2) {
        dx *= PAGE_DELTA_PX;
        dy *= PAGE_DELTA_PX;
      }

      /* Mostly-vertical (or noise) → belongs to the page, not this rail */
      const ax = Math.abs(dx);
      if (ax < 1 || ax <= Math.abs(dy)) return;

      if (event.cancelable) event.preventDefault();

      scroller.classList.add("is-free-scroll");
      scroller.scrollLeft += dx;

      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(endGesture, WHEEL_SETTLE_MS);
    };

    scroller.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      scroller.removeEventListener("wheel", onWheel);
      window.clearTimeout(settleTimer);
      scroller.classList.remove("is-free-scroll");
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
        /* Trackpad swipe drives this rail — keep Lenis off horizontal gestures */
        data-lenis-prevent-horizontal
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
