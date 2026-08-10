"use client";

import Image from "next/image";
import { useLenis } from "lenis/react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ClickSpark } from "@/components/ClickSpark";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { asset } from "@/lib/assets";

const TAGS = [
  "Brand Identity",
  "Motion Graphics & Film",
  "Brand Strategy",
  "Verbal Identity",
  "Technology",
  "Climate & Sustainability",
] as const;

type MediaItem =
  | { kind: "full"; src: string; alt: string; ratio: string }
  | { kind: "pair"; left: { src: string; alt: string; ratio: string }; right: { src: string; alt: string; ratio: string } };

const MEDIA: MediaItem[] = [
  {
    kind: "full",
    src: asset("/images/projects/homeroll - 1.jpg"),
    alt: "Demo hero still",
    ratio: "56.25%",
  },
  {
    kind: "pair",
    left: {
      src: asset("/images/projects/homeroll - 2.jpg"),
      alt: "Demo frame A",
      ratio: "133.6%",
    },
    right: {
      src: asset("/images/projects/homeroll - 3.jpg"),
      alt: "Demo frame B",
      ratio: "133.6%",
    },
  },
  {
    kind: "full",
    src: asset("/images/projects/homeroll - 4.jpg"),
    alt: "Demo featured still",
    ratio: "56.25%",
  },
  {
    kind: "pair",
    left: {
      src: asset("/images/projects/homeroll - 5.jpg"),
      alt: "Demo frame C",
      ratio: "100%",
    },
    right: {
      src: asset("/images/projects/homeroll - 6.jpg"),
      alt: "Demo frame D",
      ratio: "100%",
    },
  },
  {
    kind: "full",
    src: asset("/images/projects/homeroll - 7.jpg"),
    alt: "Demo landscape still",
    ratio: "56.25%",
  },
  {
    kind: "pair",
    left: {
      src: asset("/images/projects/homeroll - 8.jpg"),
      alt: "Demo frame E",
      ratio: "133.6%",
    },
    right: {
      src: asset("/images/projects/homeroll - 9.jpg"),
      alt: "Demo frame F",
      ratio: "133.6%",
    },
  },
  {
    kind: "full",
    src: asset("/images/projects/homeroll - 10.jpg"),
    alt: "Demo closing still",
    ratio: "56.25%",
  },
  {
    kind: "pair",
    left: {
      src: asset("/images/projects/homeroll - 11.jpg"),
      alt: "Demo frame G",
      ratio: "100%",
    },
    right: {
      src: asset("/images/projects/homeroll - 12.jpg"),
      alt: "Demo frame H",
      ratio: "100%",
    },
  },
];

function readCssPx(name: string, fallback: number) {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readHeaderOffset() {
  return readCssPx("--header-offset", 60);
}

function readShellGutter() {
  return readCssPx("--shell-gutter", 24);
}

/** Keep in sync with `--about-push-ms` in globals.css */
function readAboutPushMs() {
  if (typeof window === "undefined") return 900;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--about-push-ms")
    .trim();
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 900;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function Frame({
  src,
  alt,
  ratio,
}: {
  src: string;
  alt: string;
  ratio: string;
}) {
  return (
    <div className="project-case-demo__frame" style={{ paddingBottom: ratio }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 800px) 100vw, 70vw"
        className="project-case-demo__img"
        draggable={false}
      />
    </div>
  );
}

/**
 * Living Pentagram-style case layout (mounted on `/projects/[slug]`):
 * video hero with left-stacked overlay, image weave, case panel toggle.
 */
export function ProjectCaseDemo() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [btnReady, setBtnReady] = useState(false);
  const [btnTop, setBtnTop] = useState(0);
  const panelId = useId();
  const bodyRef = useRef<HTMLDivElement>(null);
  const mediaStackRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const panelInnerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  lenisRef.current = lenis;

  const isMobilePanel = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 799px)").matches;

  const scrollCopyToStart = (opts?: { smooth?: boolean }) => {
    const panel = panelRef.current;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const smooth = Boolean(opts?.smooth) && !reduceMotion;
    /* Mobile sheet scrolls itself — don’t move the page under it */
    if (isMobilePanel()) {
      panel?.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
      panelInnerRef.current?.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    const body = bodyRef.current;
    if (!body) return;
    const offset = -(readHeaderOffset() + readShellGutter());
    const target = panel ?? body;
    const lenisNow = lenisRef.current;
    if (lenisNow) {
      if (smooth) {
        lenisNow.scrollTo(target, {
          offset,
          duration: readAboutPushMs() / 1000,
          easing: easeInOutCubic,
          onComplete: () => {
            /* Layout push may drift the target a few px — lock final spot */
            lenisNow.scrollTo(target, { offset, immediate: true });
          },
        });
      } else {
        lenisNow.scrollTo(target, { offset, immediate: true });
      }
    } else {
      const y =
        window.scrollY + target.getBoundingClientRect().top + offset;
      window.scrollTo({
        top: Math.max(0, y),
        behavior: smooth ? "smooth" : "auto",
      });
    }
    panelInnerRef.current?.scrollTo({ top: 0, behavior: "auto" });
  };

  const toggleOpen = () => setOpen((prev) => !prev);

  useEffect(() => {
    setMounted(true);
  }, []);

  /*
   * Center-X, prefer ~30px above the viewport bottom.
   * Top: clamp to contentTop + inset (gap under first frames, then stop).
   * Bottom: rest in the pad under the last frame — never on the images,
   * never into Related / footer.
   * Hero: hide once media top clears the pin slot — no loose hysteresis
   * that re-shows a flash over the video.
   */
  useEffect(() => {
    const media = mediaStackRef.current;
    const body = bodyRef.current;
    if (!media) return;

    const sync = () => {
      const mediaRect = media.getBoundingClientRect();
      const panelRect = panelRef.current?.getBoundingClientRect();
      const mobile = isMobilePanel();
      const contentTop = mediaRect.top;
      /* When open on desktop, taller of media vs copy defines the box */
      const contentBottom =
        open && !mobile && panelRect && panelRect.height > 0
          ? Math.max(mediaRect.bottom, panelRect.bottom)
          : mediaRect.bottom;
      const viewH = window.visualViewport?.height ?? window.innerHeight;
      const pinBottom = 30;
      const btnH = pinRef.current?.offsetHeight || 44;
      const preferredTop = viewH - pinBottom - btnH;
      const inset = Math.max(readShellGutter(), 32);
      const minTop = contentTop + inset;
      const relatedEl = document.querySelector(".project-detail__related");
      const relatedTop =
        relatedEl?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      const footerEl = document.querySelector(".site-footer");
      const footerTop =
        footerEl?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      const bodyBottom =
        body?.getBoundingClientRect().bottom ?? Number.POSITIVE_INFINITY;
      /*
       * Hard stop in the gap under the last frame (body pad / Related),
       * not on the images — do not clamp to contentBottom.
       */
      const bandBottom = Math.min(relatedTop, footerTop, bodyBottom);
      const maxTop = bandBottom - inset - btnH;

      /* Mobile open sheet: park at preferred bottom so Close stays reachable */
      if (open && mobile) {
        setBtnReady(true);
        setBtnTop((prev) => (prev === preferredTop ? prev : preferredTop));
        return;
      }

      const hasRoom = maxTop >= minTop;
      /*
       * Visible only while media has entered enough that the docked top
       * (minTop) still sits at/above the preferred pin — not over the hero.
       */
      const nextReady =
        hasRoom &&
        contentTop < preferredTop &&
        contentBottom > inset &&
        minTop < viewH;
      const top = nextReady
        ? Math.min(Math.max(preferredTop, minTop), maxTop)
        : preferredTop;

      setBtnReady((prev) => (prev === nextReady ? prev : nextReady));
      setBtnTop((prev) => (prev === top ? prev : top));
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    const ro = new ResizeObserver(sync);
    ro.observe(media);
    if (body) ro.observe(body);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [mounted, open]);

  /*
   * On open: ease page to copy line 1 (same duration as the panel push).
   * Disable scroll anchoring so width change doesn’t fight Lenis mid-tween.
   */
  useLayoutEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevAnchor = root.style.overflowAnchor;
    root.style.overflowAnchor = "none";
    let rafInner = 0;
    const rafOuter = requestAnimationFrame(() => {
      rafInner = requestAnimationFrame(() => {
        scrollCopyToStart({ smooth: true });
      });
    });
    const restoreId = window.setTimeout(() => {
      root.style.overflowAnchor = prevAnchor;
    }, readAboutPushMs() + 80);
    return () => {
      cancelAnimationFrame(rafOuter);
      cancelAnimationFrame(rafInner);
      window.clearTimeout(restoreId);
      root.style.overflowAnchor = prevAnchor;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !isMobilePanel()) return;
    const scrollY = window.scrollY;
    const { body } = document;
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    panelRef.current?.scrollTo({ top: 0, behavior: "auto" });
    return () => {
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  return (
    <div className={`project-case-demo${open ? " is-panel-open" : ""}`}>
      <section className="project-case-demo__hero" aria-label="Univers demo">
        <div className="project-case-demo__hero-media" aria-hidden="true">
          <ProtectedVideo
            className="project-case-demo__hero-video"
            src={asset("videos/home-hero-video.mp4")}
            preload="metadata"
            fetchPriority="low"
          />
          <div className="project-case-demo__hero-scrim" />
        </div>

        <div className="project-case-demo__hero-copy">
          <h1 className="project-case-demo__title">Univers</h1>
          <p className="project-case-demo__summary">
            Strategy, brand system, and website for the world’s most
            comprehensive decarbonisation platform.
          </p>
          <ul className="project-case-demo__tags">
            {TAGS.map((tag) => (
              <li key={tag}>
                <span className="project-case-demo__tag">{tag}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {mounted
        ? createPortal(
            <div
              ref={pinRef}
              className={`project-case-demo__toggle-pin${btnReady ? " is-ready" : ""}`}
              style={{ top: btnTop }}
            >
              <ClickSpark>
                <div className="project-case-demo__toggle-glass">
                  <button
                    type="button"
                    className={`project-case-demo__toggle${open ? " is-open" : ""}`}
                    aria-expanded={open}
                    aria-controls={panelId}
                    tabIndex={btnReady ? 0 : -1}
                    onClick={toggleOpen}
                  >
                    <span>About The Project</span>
                    <span
                      className="project-case-demo__toggle-icon"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </button>
                </div>
              </ClickSpark>
            </div>,
            document.body,
          )
        : null}

      <div ref={bodyRef} className="project-case-demo__body">
        <div className="project-case-demo__columns">
          <div className="project-case-demo__media-col">
            <div ref={mediaStackRef} className="project-case-demo__media-stack">
              {MEDIA.map((item, index) => {
                if (item.kind === "pair") {
                  return (
                    <div key={`pair-${index}`} className="project-case-demo__pair">
                      <Frame {...item.left} />
                      <Frame {...item.right} />
                    </div>
                  );
                }
                return (
                  <div key={`full-${index}`} className="project-case-demo__full">
                    <Frame {...item} />
                  </div>
                );
              })}
            </div>
          </div>

          <aside
            ref={panelRef}
            id={panelId}
            className="project-case-demo__panel"
            aria-hidden={!open}
            {...(!open ? { inert: true } : {})}
          >
            <div ref={panelInnerRef} className="project-case-demo__panel-inner">
              <button
                type="button"
                className="project-case-demo__panel-close"
                onClick={() => setOpen(false)}
              >
                Close
              </button>

              <div className="project-case-demo__panel-copy">
                <section className="project-case-demo__panel-block">
                  <h3 className="project-case-demo__panel-title">
                    Unity Through Connection
                  </h3>
                  <p>
                    Univers is a global platform designed to coordinate the
                    systems required to reach net zero. Connecting people, data,
                    hardware, and organisations, it enables governments and
                    businesses to measure impact and act collectively on climate.
                  </p>
                  <p>
                    As the climate crisis shifts from debate to implementation,
                    the need for coordinated action has become clear. Univers was
                    created to meet this challenge, building an ecosystem that
                    helps business and government leaders measure, manage, and
                    accelerate decarbonisation. Today it connects more than 365
                    million devices, manages 845GW of renewable energy, and
                    supports a network of over 500 partners, including Microsoft,
                    Starbucks, and HSBC.
                  </p>
                </section>
                <section className="project-case-demo__panel-block">
                  <h3 className="project-case-demo__panel-title">The Challenge</h3>
                  <p>
                    Formerly Envision Digital, the company partnered with
                    Pentagram to create a future-facing brand that matched the
                    scale of its ambition and the promise of its new name,
                    Univers. The visual identity and digital experience were
                    designed to communicate a highly complex decarbonisation
                    platform in a clear, compelling, and scalable way.
                  </p>
                </section>
                <section className="project-case-demo__panel-block">
                  <h3 className="project-case-demo__panel-title">Strategy</h3>
                  <p>
                    At the heart of Univers is a simple principle: connection
                    generates energy. Previously isolated technologies are brought
                    together into a single ecosystem, where environmental and
                    operational data can be monitored, analysed, and coordinated
                    in real time.
                  </p>
                  <p>
                    From individual devices to global infrastructure, Univers
                    reframes decarbonisation as an interconnected network working
                    toward a shared goal.
                  </p>
                </section>
                <section className="project-case-demo__panel-block">
                  <h3 className="project-case-demo__panel-title">Identity</h3>
                  <p>
                    The identity translates this principle into a graphic language
                    inspired by the structure of the universe. At the micro scale,
                    the dot represents data, precision, and the individual actor.
                    At the macro scale, the universe symbolises collective impact
                    and global possibility.
                  </p>
                  <p>
                    Together these elements create a flexible design system that
                    adapts seamlessly across software, hardware, communications,
                    and immersive environments.
                  </p>
                </section>
                <section className="project-case-demo__panel-block">
                  <h3 className="project-case-demo__panel-title">
                    Symbol and Wordmark
                  </h3>
                  <p>
                    The symbol expresses coordination through motion. Eight
                    spheres orbit before converging into a single gravitational
                    form, illustrating how independent elements align around a
                    common purpose.
                  </p>
                  <p>
                    The geometric wordmark balances engineered precision with
                    clarity. A bespoke ‘un’ ligature anchors the identity,
                    embodying the act of joining, an idea central to the original
                    brief.
                  </p>
                </section>
                <section className="project-case-demo__panel-block">
                  <h3 className="project-case-demo__panel-title">Visual System</h3>
                  <p>
                    The visual language extends across colour, imagery, and
                    motion. A neutral base palette grounds the brand, while
                    vibrant accents signal energy and discovery. Art direction
                    celebrates the Earth as both subject and responsibility.
                    Cinematic 3D imagery reinforces the principles of harmony and
                    connection, pairing human presence with a sense of the
                    infinite.
                  </p>
                </section>
                <section className="project-case-demo__panel-block">
                  <h3 className="project-case-demo__panel-title">
                    Generative Design Tool
                  </h3>
                  <p>
                    A bespoke generative tool enables the design team to
                    continuously expand the system. Each sphere sits within its
                    own orbit, creating a miniature solar system where elements
                    move independently while remaining connected. The tool
                    produces infinite compositions while maintaining a coherent
                    visual language.
                  </p>
                </section>
                <section className="project-case-demo__panel-block">
                  <h3 className="project-case-demo__panel-title">Outcome</h3>
                  <p>
                    Univers positions decarbonisation as a coordinated effort
                    rather than a collection of isolated actions. Through
                    strategy, identity, and digital design, the project
                    establishes a flexible framework for communicating one of the
                    world&apos;s most ambitious climate technology platforms.
                  </p>
                </section>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
