"use client";

import Image from "next/image";
import { useLenis } from "lenis/react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ClickSpark } from "@/components/ClickSpark";
import { GlareHover, GLARE_WIPE_MS } from "@/components/GlareHover";
import { ProtectedVideo } from "@/components/ProtectedVideo";
import { asset } from "@/lib/assets";

const ABOUT_BTN_FILL = "rgba(232, 232, 232, 0.82)";

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
    <div className="about-case-demo__frame" style={{ paddingBottom: ratio }}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 800px) 100vw, 70vw"
        className="about-case-demo__img"
        draggable={false}
      />
    </div>
  );
}

/**
 * Living Pentagram-style case layout (mounted on `/projects/[slug]`):
 * video hero with left-stacked overlay, image weave, About panel toggle.
 */
export function AboutCaseDemo() {
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

  const isMobileAbout = () =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 799px)").matches;

  const scrollCopyToStart = () => {
    const panel = panelRef.current;
    /* Mobile sheet scrolls itself — don’t move the page under it */
    if (isMobileAbout()) {
      panel?.scrollTo({ top: 0, behavior: "auto" });
      panelInnerRef.current?.scrollTo({ top: 0, behavior: "auto" });
      return;
    }
    const body = bodyRef.current;
    if (!body) return;
    const offset = -(readHeaderOffset() + readShellGutter());
    const target = panel ?? body;
    const lenisNow = lenisRef.current;
    if (lenisNow) {
      lenisNow.scrollTo(target, { offset, immediate: true });
    } else {
      const y =
        window.scrollY + target.getBoundingClientRect().top + offset;
      window.scrollTo({ top: Math.max(0, y), behavior: "auto" });
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
   * Bottom: cap by footer only (gap above footer).
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
      const mobile = isMobileAbout();
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
      const footerEl = document.querySelector(".site-footer");
      const footerTop =
        footerEl?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      const maxTop = footerTop - inset - btnH;

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
   * On open: jump to copy line 1. Layout width change can trigger scroll
   * anchoring and undo a single scrollTo — disable anchoring and re-apply.
   */
  useLayoutEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevAnchor = root.style.overflowAnchor;
    root.style.overflowAnchor = "none";
    scrollCopyToStart();
    let id2 = 0;
    const id1 = requestAnimationFrame(() => {
      scrollCopyToStart();
      id2 = requestAnimationFrame(() => {
        scrollCopyToStart();
        root.style.overflowAnchor = prevAnchor;
      });
    });
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
      root.style.overflowAnchor = prevAnchor;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !isMobileAbout()) return;
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
    <div className={`about-case-demo${open ? " is-about-open" : ""}`}>
      <section className="about-case-demo__hero" aria-label="Univers demo">
        <div className="about-case-demo__hero-media" aria-hidden="true">
          <ProtectedVideo
            className="about-case-demo__hero-video"
            src={asset("videos/home-hero-video.mp4")}
            preload="metadata"
          />
          <div className="about-case-demo__hero-scrim" />
        </div>

        <div className="about-case-demo__hero-copy">
          <h1 className="about-case-demo__title">Univers</h1>
          <p className="about-case-demo__summary">
            Strategy, brand system, and website for the world’s most
            comprehensive decarbonisation platform.
          </p>
          <ul className="about-case-demo__tags">
            {TAGS.map((tag) => (
              <li key={tag}>
                <span className="about-case-demo__tag">{tag}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {mounted
        ? createPortal(
            <div
              ref={pinRef}
              className={`about-case-demo__about-pin${btnReady ? " is-ready" : ""}`}
              style={{ top: btnTop }}
            >
              <ClickSpark>
                <GlareHover
                  width="auto"
                  height="auto"
                  background={ABOUT_BTN_FILL}
                  borderRadius="999px"
                  borderColor={ABOUT_BTN_FILL}
                  glareColor="#ffffff"
                  glareOpacity={0.55}
                  transitionDuration={GLARE_WIPE_MS}
                  className="about-case-demo__about-glare"
                >
                  <button
                    type="button"
                    className={`about-case-demo__about-btn${open ? " is-open" : ""}`}
                    aria-expanded={open}
                    aria-controls={panelId}
                    tabIndex={btnReady ? 0 : -1}
                    onClick={toggleOpen}
                  >
                    <span>About The Project</span>
                    <span
                      className="about-case-demo__about-icon"
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </button>
                </GlareHover>
              </ClickSpark>
            </div>,
            document.body,
          )
        : null}

      <div ref={bodyRef} className="about-case-demo__body">
        <div className="about-case-demo__columns">
          <div className="about-case-demo__media-col">
            <div ref={mediaStackRef} className="about-case-demo__media-stack">
              {MEDIA.map((item, index) => {
                if (item.kind === "pair") {
                  return (
                    <div key={`pair-${index}`} className="about-case-demo__pair">
                      <Frame {...item.left} />
                      <Frame {...item.right} />
                    </div>
                  );
                }
                return (
                  <div key={`full-${index}`} className="about-case-demo__full">
                    <Frame {...item} />
                  </div>
                );
              })}
            </div>
          </div>

          <aside
            ref={panelRef}
            id={panelId}
            className="about-case-demo__panel"
            aria-hidden={!open}
            {...(!open ? { inert: true } : {})}
          >
            <div ref={panelInnerRef} className="about-case-demo__panel-inner">
              <button
                type="button"
                className="about-case-demo__panel-close"
                onClick={() => setOpen(false)}
              >
                Close
              </button>

              <div className="about-case-demo__panel-copy">
                <section className="about-case-demo__panel-block">
                  <h3 className="about-case-demo__panel-title">
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
                <section className="about-case-demo__panel-block">
                  <h3 className="about-case-demo__panel-title">The Challenge</h3>
                  <p>
                    Formerly Envision Digital, the company partnered with
                    Pentagram to create a future-facing brand that matched the
                    scale of its ambition and the promise of its new name,
                    Univers. The visual identity and digital experience were
                    designed to communicate a highly complex decarbonisation
                    platform in a clear, compelling, and scalable way.
                  </p>
                </section>
                <section className="about-case-demo__panel-block">
                  <h3 className="about-case-demo__panel-title">Strategy</h3>
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
                <section className="about-case-demo__panel-block">
                  <h3 className="about-case-demo__panel-title">Identity</h3>
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
                <section className="about-case-demo__panel-block">
                  <h3 className="about-case-demo__panel-title">
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
                <section className="about-case-demo__panel-block">
                  <h3 className="about-case-demo__panel-title">Visual System</h3>
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
                <section className="about-case-demo__panel-block">
                  <h3 className="about-case-demo__panel-title">
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
                <section className="about-case-demo__panel-block">
                  <h3 className="about-case-demo__panel-title">Outcome</h3>
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
